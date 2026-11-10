import JSZip from 'jszip'
import type { Content, Photo } from '../lib/types'

/** Fotografía dentro del editor: metadatos + versión optimizada en memoria. */
export interface EditorPhoto extends Photo {
  blob: Blob
  /** URL temporal (blob:) para previsualizar. */
  url: string
}

export interface EditorState {
  content: Omit<Content, 'photos'>
  photos: EditorPhoto[]
}

const MAX_SIDE = 1600
const newId = () => Math.random().toString(36).slice(2, 9)
const extOf = (blob: Blob) => (blob.type === 'image/webp' ? 'webp' : blob.type === 'image/png' ? 'png' : 'jpg')
export const fileNameOf = (p: EditorPhoto) => `foto-${p.id}.${extOf(p.blob)}`

const toBlob = (canvas: HTMLCanvasElement, type: string, q: number) =>
  new Promise<Blob | null>((res) => canvas.toBlob(res, type, q))

/**
 * Crea una versión optimizada para teléfonos (máx. 1600 px, WebP si el navegador
 * puede generarlo; si no, JPEG). El archivo original nunca se modifica.
 */
export async function optimize(file: Blob): Promise<{ blob: Blob; width: number; height: number }> {
  const src = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = src
    await img.decode()
    const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight))
    const width = Math.round(img.naturalWidth * scale)
    const height = Math.round(img.naturalHeight * scale)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(img, 0, 0, width, height)
    let blob = await toBlob(canvas, 'image/webp', 0.82)
    if (!blob || blob.type !== 'image/webp') blob = await toBlob(canvas, 'image/jpeg', 0.85)
    if (!blob) throw new Error('No se pudo convertir la imagen')
    return { blob, width, height }
  } finally {
    URL.revokeObjectURL(src)
  }
}

export async function photoFromFile(file: File, section: Photo['section']): Promise<EditorPhoto> {
  const { blob, width, height } = await optimize(file)
  return { id: newId(), src: '', section, width, height, blob, url: URL.createObjectURL(blob) }
}

/* ---------------- Guardado local del borrador (IndexedDB) ---------------- */

const DB = 'invitacion-editor'
const STORE = 'borrador'

function db(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => res(req.result)
    req.onerror = () => rej(req.error)
  })
}

export async function saveDraft(state: EditorState) {
  const d = await db()
  const value = { content: state.content, photos: state.photos.map(({ url: _url, ...p }) => p) }
  await new Promise<void>((res, rej) => {
    const tx = d.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(value, 'actual')
    tx.oncomplete = () => res()
    tx.onerror = () => rej(tx.error)
  })
  d.close()
}

export async function loadDraft(): Promise<EditorState | null> {
  const d = await db()
  const value = await new Promise<{ content: EditorState['content']; photos: Omit<EditorPhoto, 'url'>[] } | undefined>(
    (res, rej) => {
      const req = d.transaction(STORE).objectStore(STORE).get('actual')
      req.onsuccess = () => res(req.result)
      req.onerror = () => rej(req.error)
    },
  )
  d.close()
  if (!value) return null
  return {
    content: value.content,
    photos: value.photos.map((p) => ({ ...p, url: URL.createObjectURL(p.blob) })),
  }
}

export async function clearDraft() {
  const d = await db()
  await new Promise<void>((res) => {
    const tx = d.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete('actual')
    tx.oncomplete = () => res()
  })
  d.close()
}

/* ---------------- Exportar / importar ZIP ---------------- */

const README = `ÁLBUM DE LA INVITACIÓN — CÓMO PUBLICARLO
========================================

Este ZIP contiene:
  content.json   -> textos, datos del evento y orden de las fotografías
  photos/        -> fotografías optimizadas para teléfonos

Pasos:
  1. Descomprime este ZIP.
  2. En el proyecto, BORRA el contenido de la carpeta  public/photos/
     y copia dentro todos los archivos de la carpeta  photos/  de este ZIP.
  3. Reemplaza  src/content/content.json  por el  content.json  de este ZIP.
  4. Comprueba el resultado con:  npm run dev
  5. Publica:  git add -A && git commit -m "Actualizar álbum" && git push

IMPORTANTE: GitHub Pages es un alojamiento público. Cualquier persona con
la URL podrá ver las fotografías que publiques.
`

export function contentForExport(state: EditorState): Content {
  return {
    ...state.content,
    photos: state.photos.map(({ blob: _b, url: _u, ...p }) => {
      const clean: Photo = { ...p, src: `photos/${fileNameOf({ ...p, blob: _b, url: _u })}` }
      for (const k of ['title', 'age', 'year', 'dedication', 'description'] as const) {
        if (!clean[k]?.trim()) delete clean[k]
      }
      return clean
    }),
  }
}

export async function exportZip(state: EditorState): Promise<Blob> {
  const zip = new JSZip()
  zip.file('content.json', JSON.stringify(contentForExport(state), null, 2) + '\n')
  zip.file('LEEME.txt', README)
  const folder = zip.folder('photos')!
  for (const p of state.photos) folder.file(fileNameOf(p), p.blob)
  return zip.generateAsync({ type: 'blob', compression: 'STORE' })
}

const MIME: Record<string, string> = { webp: 'image/webp', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png' }

/** Abre un ZIP exportado anteriormente para seguir editándolo. */
export async function importZip(file: Blob): Promise<EditorState> {
  const zip = await JSZip.loadAsync(file)
  const json = zip.file('content.json')
  if (!json) throw new Error('El ZIP no contiene content.json')
  const { photos, ...content } = JSON.parse(await json.async('string')) as Content
  const out: EditorPhoto[] = []
  for (const p of photos) {
    const entry = zip.file(p.src)
    if (!entry) continue
    const ext = p.src.split('.').pop()!.toLowerCase()
    const blob = new Blob([await entry.async('arraybuffer')], { type: MIME[ext] ?? 'image/jpeg' })
    out.push({ ...p, blob, url: URL.createObjectURL(blob) })
  }
  return { content, photos: out }
}

export function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
