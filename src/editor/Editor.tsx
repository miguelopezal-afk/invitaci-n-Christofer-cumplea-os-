import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  Download,
  Eye,
  FolderOpen,
  GripVertical,
  ImagePlus,
  Images,
  RefreshCw,
  Star,
  Trash2,
  Type,
} from 'lucide-react'
import raw from '../content/content.json'
import Invitation from '../components/Invitation'
import { SECTIONS, type Content, type SectionId } from '../lib/types'
import {
  clearDraft,
  download,
  exportZip,
  importZip,
  loadDraft,
  optimize,
  photoFromFile,
  saveDraft,
  type EditorPhoto,
  type EditorState,
} from './lib'

const { photos: _demo, ...baseContent } = raw as Content
const initial: EditorState = { content: baseContent, photos: [] }

/** Un borrador o ZIP guardado con una versión anterior de los textos (content.json → version). */
const isOld = (s: EditorState) => !s.content?.texts || (s.content.version ?? 0) < (baseContent.version ?? 0)

/**
 * Pone al día un borrador o ZIP guardado con una versión anterior del proyecto:
 * conserva las fotografías y, si los textos son de una versión anterior, toma los
 * actuales; si no, solo completa los textos que aún no existían.
 */
const upgrade = (s: EditorState): EditorState =>
  isOld(s)
    ? { ...s, content: baseContent }
    : { ...s, content: { ...s.content, texts: { ...baseContent.texts, ...s.content.texts } } }

const OLD_NOTICE =
  'Este álbum se guardó con una versión anterior de los textos: se conservaron las fotografías y se cargaron los textos y datos actuales.'

const TEXT_LABELS: Record<string, string> = {
  heroEyebrow: 'Portada · línea superior',
  heroLang: 'Portada · idioma (código: es, en…)',
  heroTitle: 'Portada · título',
  heroSubtitle: 'Portada · subtítulo',
  heroButton: 'Portada · botón',
  storyEyebrow: 'Cuento · entrada',
  storyTitle: 'Cuento · título',
  storyLang: 'Cuento · idioma (código: es, en…)',
  story1: 'Cuento · capítulo 1 (tras la portada)',
  story2: 'Cuento · capítulo 2 (creciendo)',
  story3: 'Cuento · capítulo final (sueños)',
  earlyTitle: 'Primeros años · título',
  earlyText: 'Primeros años · texto',
  carouselHint: 'Carruseles · aviso bajo las fotos',
  growingTitle: 'Creciendo · título',
  growingText: 'Creciendo · texto',
  dreamsTitle: 'Sueños · título',
  dreamsText: 'Sueños · texto',
  dreamsNote: 'Sueños · nota bajo la ilustración',
  momentText: 'Gran momento · mensaje',
  momentClosing: 'Gran momento · cierre',
  inviteTitle: 'Invitación · título',
  inviteText: 'Invitación · texto',
  whatsappCaption: 'Invitación · inscripción sobre la bata de WhatsApp',
  whatsappButton: 'Invitación · botón de WhatsApp',
  inviteClosing: 'Invitación · mensaje final',
  shareTitle: 'Compartir · título al enviar la invitación',
  shareMessage: 'Compartir · mensaje que acompaña al enlace (también por WhatsApp)',
  footer: 'Pie de página',
}

type Tab = 'fotos' | 'textos' | 'vista' | 'exportar'
const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'fotos', label: 'Fotografías', icon: <Images className="h-4 w-4" /> },
  { id: 'textos', label: 'Datos y textos', icon: <Type className="h-4 w-4" /> },
  { id: 'vista', label: 'Vista previa', icon: <Eye className="h-4 w-4" /> },
  { id: 'exportar', label: 'Exportar', icon: <Download className="h-4 w-4" /> },
]

const input =
  'w-full rounded-md border border-navy/20 bg-white px-3 py-2 font-sans text-sm text-navy placeholder:text-navy/35 focus:border-navy focus:outline-none'
const smallBtn =
  'inline-flex h-10 min-w-10 items-center justify-center gap-1.5 rounded-md border border-navy/15 bg-white px-2.5 text-xs font-medium text-navy hover:border-navy disabled:opacity-30'

export default function Editor() {
  const [state, setState] = useState<EditorState>(initial)
  const [ready, setReady] = useState(false)
  const [tab, setTab] = useState<Tab>('fotos')
  const [target, setTarget] = useState<SectionId>('primeros')
  const [busy, setBusy] = useState('')
  const [notice, setNotice] = useState('')
  const dragId = useRef<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  // Recuperar el borrador guardado en este navegador.
  useEffect(() => {
    loadDraft()
      .then((d) => {
        if (!d) return
        setState(upgrade(d))
        if (isOld(d)) setNotice(OLD_NOTICE)
      })
      .catch(() => {})
      .finally(() => setReady(true))
  }, [])

  // Guardar el borrador automáticamente (solo en este dispositivo).
  useEffect(() => {
    if (!ready) return
    const t = setTimeout(() => saveDraft(state).catch(() => {}), 500)
    return () => clearTimeout(t)
  }, [state, ready])

  const setPhotos = (fn: (p: EditorPhoto[]) => EditorPhoto[]) => setState((s) => ({ ...s, photos: fn(s.photos) }))
  const patch = (id: string, data: Partial<EditorPhoto>) =>
    setPhotos((ps) => ps.map((p) => (p.id === id ? { ...p, ...data } : p)))

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return
    const failed: string[] = []
    const list = Array.from(files)
    for (let i = 0; i < list.length; i++) {
      setBusy(`Optimizando ${i + 1} de ${list.length}…`)
      try {
        const photo = await photoFromFile(list[i], target)
        setPhotos((ps) => [...ps, photo])
      } catch {
        failed.push(list[i].name)
      }
    }
    setBusy('')
    setNotice(
      failed.length
        ? `No se pudieron leer: ${failed.join(', ')}. Prueba con JPG o PNG (o ábrelas desde Safari si son HEIC).`
        : `${list.length} fotografía(s) agregadas a "${SECTIONS.find((s) => s.id === target)!.label}".`,
    )
  }

  const replace = async (id: string, file?: File) => {
    if (!file) return
    setBusy('Optimizando…')
    try {
      const { blob, width, height } = await optimize(file)
      patch(id, { blob, width, height, url: URL.createObjectURL(blob) })
    } catch {
      setNotice(`No se pudo leer ${file.name}.`)
    }
    setBusy('')
  }

  /** Mueve una fotografía antes de otra (o al final de una sección). */
  const moveTo = (id: string, section: SectionId, beforeId?: string) =>
    setPhotos((ps) => {
      const moving = ps.find((p) => p.id === id)
      if (!moving || id === beforeId) return ps
      const rest = ps.filter((p) => p.id !== id)
      const item = { ...moving, section }
      let at = beforeId ? rest.findIndex((p) => p.id === beforeId) : -1
      if (at < 0) {
        // al final de la sección
        const last = rest.map((p) => p.section).lastIndexOf(section)
        at = last < 0 ? rest.length : last + 1
      }
      return [...rest.slice(0, at), item, ...rest.slice(at)]
    })

  const nudge = (id: string, dir: -1 | 1) =>
    setPhotos((ps) => {
      const me = ps.find((p) => p.id === id)!
      const same = ps.filter((p) => p.section === me.section)
      const other = same[same.indexOf(me) + dir]
      if (!other) return ps
      const a = ps.indexOf(me)
      const b = ps.indexOf(other)
      const next = [...ps]
      next[a] = other
      next[b] = me
      return next
    })

  const makeCover = (id: string) =>
    setPhotos((ps) => {
      const me = ps.find((p) => p.id === id)!
      return [{ ...me, section: 'portada' }, ...ps.filter((p) => p.id !== id)]
    })

  const previewContent: Content = useMemo(
    () => ({ ...state.content, photos: state.photos.map(({ blob: _b, url, ...p }) => ({ ...p, src: url })) }),
    [state],
  )

  const doExport = async () => {
    setBusy('Generando ZIP…')
    try {
      download(await exportZip(state), 'album-chrystofer-22.zip')
      setNotice('ZIP descargado. Sigue los pasos de abajo para publicarlo.')
    } catch (e) {
      setNotice(`No se pudo generar el ZIP: ${(e as Error).message}`)
    }
    setBusy('')
  }

  const doImport = async (file?: File) => {
    if (!file) return
    setBusy('Abriendo ZIP…')
    try {
      const loaded = await importZip(file)
      setState(upgrade(loaded))
      setNotice(isOld(loaded) ? OLD_NOTICE : 'Álbum cargado desde el ZIP.')
    } catch (e) {
      setNotice(`No se pudo abrir el ZIP: ${(e as Error).message}`)
    }
    setBusy('')
  }

  const reset = async () => {
    if (!window.confirm('¿Borrar el borrador de este navegador y empezar de cero? Tus fotografías originales no se tocan.')) return
    await clearDraft().catch(() => {})
    setState(initial)
    setNotice('Borrador eliminado.')
  }

  const totalKb = Math.round(state.photos.reduce((n, p) => n + p.blob.size, 0) / 1024)

  return (
    <div className="min-h-screen bg-cream pb-24">
      <header className="sticky top-0 z-30 border-b border-navy/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <div>
            <h1 className="font-display text-xl text-navy">Editor del álbum</h1>
            <p className="font-sans text-xs text-navy/60">
              Herramienta local · no se publica · {state.photos.length} fotografías · {totalKb} KB
            </p>
          </div>
          <nav className="flex gap-1 overflow-x-auto" aria-label="Secciones del editor">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                aria-current={tab === t.id}
                className={`inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-medium ${
                  tab === t.id ? 'bg-navy text-white' : 'text-navy hover:bg-sky/50'
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </nav>
        </div>
        {(busy || notice) && (
          <p role="status" className="border-t border-navy/10 bg-sky/40 px-4 py-2 text-center font-sans text-sm text-navy">
            {busy || notice}
          </p>
        )}
      </header>

      <div className="mx-auto max-w-5xl px-4 pt-6">
        {/* ---------------- FOTOGRAFÍAS ---------------- */}
        {tab === 'fotos' && (
          <>
            <div className="rounded-xl border border-navy/10 bg-white p-4">
              <p className="font-sans text-sm text-navy/75">
                Elige a qué sección irán y selecciona varias fotografías a la vez. Se crea una copia optimizada;
                <strong> tus originales no se modifican ni se suben a ningún servidor.</strong>
              </p>
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <label className="font-sans text-xs font-medium text-navy/70">
                  Agregar a
                  <select value={target} onChange={(e) => setTarget(e.target.value as SectionId)} className={`${input} mt-1 h-12`}>
                    {SECTIONS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="btn-primary cursor-pointer">
                  <ImagePlus className="h-4 w-4" />
                  Seleccionar fotografías
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={(e) => (addFiles(e.target.files), (e.target.value = ''))}
                  />
                </label>
              </div>
            </div>

            {SECTIONS.map((sec) => {
              const list = state.photos.filter((p) => p.section === sec.id)
              return (
                <section
                  key={sec.id}
                  className="mt-6"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    if (dragId.current) moveTo(dragId.current, sec.id)
                    dragId.current = null
                    setOverId(null)
                  }}
                >
                  <h2 className="font-display text-lg text-navy">
                    {sec.label} <span className="font-sans text-sm text-navy/50">({list.length})</span>
                  </h2>
                  <p className="font-sans text-xs text-navy/55">{sec.hint}</p>
                  {list.length === 0 ? (
                    <p className="mt-2 rounded-lg border border-dashed border-navy/25 px-4 py-6 text-center font-sans text-sm text-navy/50">
                      Sin fotografías. Agrégalas arriba o arrastra una hasta aquí.
                    </p>
                  ) : (
                    <ul className="mt-2 grid gap-3 sm:grid-cols-2">
                      {list.map((p, i) => (
                        <li
                          key={p.id}
                          draggable
                          onDragStart={(e) => {
                            dragId.current = p.id
                            e.dataTransfer.effectAllowed = 'move'
                            e.dataTransfer.setData('text/plain', p.id)
                          }}
                          onDragOver={(e) => (e.preventDefault(), setOverId(p.id))}
                          onDragEnd={() => ((dragId.current = null), setOverId(null))}
                          onDrop={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (dragId.current) moveTo(dragId.current, sec.id, p.id)
                            dragId.current = null
                            setOverId(null)
                          }}
                          className={`rounded-xl border bg-white p-3 ${
                            overId === p.id ? 'border-navy ring-2 ring-sky' : 'border-navy/10'
                          }`}
                        >
                          <div className="flex gap-3">
                            <GripVertical className="mt-1 h-5 w-5 shrink-0 cursor-grab text-navy/35" aria-hidden="true" />
                            <img
                              src={p.url}
                              alt=""
                              draggable={false}
                              className="h-28 w-24 shrink-0 rounded bg-sky/40 object-contain"
                            />
                            <div className="min-w-0 flex-1 space-y-2">
                              <select
                                aria-label="Sección"
                                value={p.section}
                                onChange={(e) => moveTo(p.id, e.target.value as SectionId)}
                                className={input}
                              >
                                {SECTIONS.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.label}
                                  </option>
                                ))}
                              </select>
                              <div className="flex flex-wrap gap-1.5">
                                <button className={smallBtn} disabled={i === 0} onClick={() => nudge(p.id, -1)} aria-label="Mover antes">
                                  <ArrowUp className="h-4 w-4" />
                                </button>
                                <button
                                  className={smallBtn}
                                  disabled={i === list.length - 1}
                                  onClick={() => nudge(p.id, 1)}
                                  aria-label="Mover después"
                                >
                                  <ArrowDown className="h-4 w-4" />
                                </button>
                                <button className={smallBtn} onClick={() => makeCover(p.id)} title="Usar como fotografía de portada">
                                  <Star className="h-4 w-4" /> Portada
                                </button>
                                <label className={`${smallBtn} cursor-pointer`} title="Reemplazar imagen">
                                  <RefreshCw className="h-4 w-4" />
                                  <span className="sr-only">Reemplazar</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={(e) => (replace(p.id, e.target.files?.[0]), (e.target.value = ''))}
                                  />
                                </label>
                                <button
                                  className={`${smallBtn} text-red-700`}
                                  onClick={() => setPhotos((ps) => ps.filter((x) => x.id !== p.id))}
                                  aria-label="Eliminar"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                              <p className="font-sans text-[0.7rem] text-navy/45">
                                {p.width}×{p.height} · {Math.round(p.blob.size / 1024)} KB
                              </p>
                            </div>
                          </div>
                          <details className="mt-2">
                            <summary className="cursor-pointer py-2 font-sans text-xs font-medium text-navy/70">
                              Título, edad, año, dedicatoria y descripción
                            </summary>
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <input className={`${input} col-span-2`} placeholder="Título" value={p.title ?? ''} onChange={(e) => patch(p.id, { title: e.target.value })} />
                              <input className={input} placeholder="Edad aproximada" value={p.age ?? ''} onChange={(e) => patch(p.id, { age: e.target.value })} />
                              <input className={input} placeholder="Año (opcional)" value={p.year ?? ''} onChange={(e) => patch(p.id, { year: e.target.value })} />
                              <input className={`${input} col-span-2`} placeholder="Dedicatoria" value={p.dedication ?? ''} onChange={(e) => patch(p.id, { dedication: e.target.value })} />
                              <textarea className={`${input} col-span-2`} rows={2} placeholder="Descripción" value={p.description ?? ''} onChange={(e) => patch(p.id, { description: e.target.value })} />
                            </div>
                          </details>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )
            })}
          </>
        )}

        {/* ---------------- DATOS Y TEXTOS ---------------- */}
        {tab === 'textos' && (
          <div className="space-y-6">
            <Panel title="Evento">
              {(
                [
                  ['dateLabel', 'Fecha'],
                  ['time', 'Hora (déjala vacía para ocultarla)'],
                  ['venue', 'Lugar'],
                  ['address', 'Dirección'],
                  ['type', 'Tipo de evento'],
                ] as const
              ).map(([k, label]) => (
                <Field key={k} label={label}>
                  <input
                    className={input}
                    value={state.content.event[k]}
                    placeholder={k === 'time' ? 'Pendiente de configurar' : ''}
                    onChange={(e) =>
                      setState((s) => ({ ...s, content: { ...s.content, event: { ...s.content.event, [k]: e.target.value } } }))
                    }
                  />
                </Field>
              ))}
            </Panel>
            <Panel title="Línea del tiempo">
              {state.content.timeline.map((g, i) => (
                <div key={g.section} className="col-span-full grid gap-2 border-b border-navy/10 pb-4 last:border-0 sm:grid-cols-3">
                  {(
                    [
                      ['title', 'Título'],
                      ['label', 'Edad o año (opcional)'],
                      ['description', 'Descripción (opcional)'],
                    ] as const
                  ).map(([k, label]) => (
                    <Field key={k} label={`${SECTIONS.find((s) => s.id === g.section)!.label} · ${label}`}>
                      <input
                        className={input}
                        value={g[k]}
                        onChange={(e) =>
                          setState((s) => ({
                            ...s,
                            content: {
                              ...s.content,
                              timeline: s.content.timeline.map((x, j) => (j === i ? { ...x, [k]: e.target.value } : x)),
                            },
                          }))
                        }
                      />
                    </Field>
                  ))}
                  <div className="sm:col-span-3">
                    <Field label={`${SECTIONS.find((s) => s.id === g.section)!.label} · Pasaje del cuento antes de esta etapa (opcional)`}>
                      <textarea
                        className={input}
                        rows={3}
                        value={g.story ?? ''}
                        onChange={(e) =>
                          setState((s) => ({
                            ...s,
                            content: {
                              ...s.content,
                              timeline: s.content.timeline.map((x, j) => (j === i ? { ...x, story: e.target.value } : x)),
                            },
                          }))
                        }
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </Panel>
            <Panel title="Textos de la invitación">
              {Object.entries(state.content.texts).map(([k, v]) => (
                <Field key={k} label={TEXT_LABELS[k] ?? k}>
                  <textarea
                    className={input}
                    rows={v.length > 60 ? (k === 'momentText' ? 8 : 3) : 1}
                    value={v}
                    onChange={(e) =>
                      setState((s) => ({ ...s, content: { ...s.content, texts: { ...s.content.texts, [k]: e.target.value } } }))
                    }
                  />
                </Field>
              ))}
            </Panel>
          </div>
        )}

        {/* ---------------- VISTA PREVIA ---------------- */}
        {tab === 'vista' && (
          <div>
            <p className="mb-3 text-center font-sans text-sm text-navy/60">
              Así se verá en un teléfono. Las secciones sin fotografías simplemente no muestran imágenes.
            </p>
            <div className="mx-auto h-[80vh] w-full max-w-[390px] overflow-y-auto rounded-[2rem] border-[10px] border-navy bg-white shadow-xl">
              <Invitation content={previewContent} />
            </div>
          </div>
        )}

        {/* ---------------- EXPORTAR ---------------- */}
        {tab === 'exportar' && (
          <div className="space-y-6">
            <Panel title="Exportar álbum">
              <div className="col-span-full space-y-4 font-sans text-sm leading-relaxed text-navy/80">
                <p>
                  Este sitio es estático: el editor <strong>no puede guardar nada en GitHub ni en un servidor</strong>.
                  Genera un ZIP con las fotografías optimizadas y el archivo <code>content.json</code>, y tú lo
                  incorporas al proyecto.
                </p>
                <button className="btn-primary" onClick={doExport} disabled={!!busy || state.photos.length === 0}>
                  <Download className="h-4 w-4" />
                  Descargar ZIP ({state.photos.length} fotografías)
                </button>
                <ol className="list-decimal space-y-1.5 pl-5">
                  <li>Descomprime el ZIP.</li>
                  <li>
                    Borra el contenido de <code>public/photos/</code> y copia ahí los archivos de la carpeta{' '}
                    <code>photos/</code> del ZIP.
                  </li>
                  <li>
                    Reemplaza <code>src/content/content.json</code> por el <code>content.json</code> del ZIP.
                  </li>
                  <li>
                    Revisa con <code>npm run dev</code> y publica con{' '}
                    <code>git add -A &amp;&amp; git commit -m "Actualizar álbum" &amp;&amp; git push</code>.
                  </li>
                </ol>
                <p className="rounded-lg border border-gold bg-cream px-4 py-3">
                  <strong>Privacidad:</strong> GitHub Pages es alojamiento público. Cualquier persona con la URL podrá
                  ver las fotografías que publiques, y el repositorio conserva su historial.
                </p>
              </div>
            </Panel>
            <Panel title="Continuar o empezar de nuevo">
              <div className="col-span-full flex flex-wrap gap-3">
                <label className="btn-outline cursor-pointer">
                  <FolderOpen className="h-4 w-4" />
                  Abrir un ZIP exportado
                  <input type="file" accept=".zip,application/zip" className="sr-only" onChange={(e) => (doImport(e.target.files?.[0]), (e.target.value = ''))} />
                </label>
                <button className="btn-outline" onClick={reset}>
                  <Trash2 className="h-4 w-4" />
                  Borrar borrador
                </button>
              </div>
              <p className="col-span-full font-sans text-xs text-navy/55">
                El borrador se guarda automáticamente solo en este navegador. Para continuar en otro dispositivo,
                exporta el ZIP y ábrelo allí.
              </p>
            </Panel>
          </div>
        )}
      </div>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-navy/10 bg-white p-4 sm:p-6">
      <h2 className="font-display text-lg text-navy">{title}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block font-sans text-xs font-medium text-navy/70">
      {label}
      <span className="mt-1 block">{children}</span>
    </label>
  )
}
