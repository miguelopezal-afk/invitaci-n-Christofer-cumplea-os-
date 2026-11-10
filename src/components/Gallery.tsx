import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { Photo } from '../lib/types'

/* ------------------------------------------------------------------ */
/* Pantalla completa                                                    */
/* ------------------------------------------------------------------ */

type OpenFn = (photos: Photo[], index: number) => void
const LightboxContext = createContext<OpenFn>(() => {})
export const useLightbox = () => useContext(LightboxContext)

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ photos: Photo[]; index: number } | null>(null)
  const open = useCallback<OpenFn>((photos, index) => setState({ photos, index }), [])
  const close = useCallback(() => setState(null), [])
  const step = useCallback(
    (d: number) =>
      setState((s) => (s ? { ...s, index: (s.index + d + s.photos.length) % s.photos.length } : s)),
    [],
  )

  useEffect(() => {
    if (!state) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [state !== null, close, step]) // eslint-disable-line react-hooks/exhaustive-deps

  const touch = useRef<{ x: number; y: number } | null>(null)
  const photo = state?.photos[state.index]
  const many = (state?.photos.length ?? 0) > 1

  return (
    <LightboxContext.Provider value={open}>
      {children}
      {state && photo && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Fotografía en pantalla completa"
          className="fixed inset-0 z-50 flex flex-col bg-[#0d1c30]/95"
          onClick={close}
          onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
          onTouchEnd={(e) => {
            if (!touch.current) return
            const dx = e.changedTouches[0].clientX - touch.current.x
            const dy = e.changedTouches[0].clientY - touch.current.y
            touch.current = null
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1)
            else if (dy > 90) close()
          }}
        >
          <div className="flex items-center justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))] text-white/80">
            <span className="font-sans text-xs tracking-widest">
              {many ? `${state.index + 1} / ${state.photos.length}` : ''}
            </span>
            <button
              autoFocus
              onClick={close}
              aria-label="Cerrar"
              className="flex h-12 w-12 items-center justify-center rounded-full text-white hover:bg-white/10"
            >
              <X className="h-7 w-7" />
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-3">
            <img
              key={photo.id}
              src={photo.src}
              alt={photo.title || 'Fotografía'}
              className="max-h-full max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {many && (
              <>
                <button
                  aria-label="Fotografía anterior"
                  onClick={(e) => (e.stopPropagation(), step(-1))}
                  className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50"
                >
                  <ChevronLeft />
                </button>
                <button
                  aria-label="Fotografía siguiente"
                  onClick={(e) => (e.stopPropagation(), step(1))}
                  className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50"
                >
                  <ChevronRight />
                </button>
              </>
            )}
          </div>
          <div className="min-h-[3.5rem] px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 text-center text-white/85">
            {photo.title && <p className="font-serif text-lg">{photo.title}</p>}
            {photo.dedication && <p className="font-serif text-base italic text-white/70">{photo.dedication}</p>}
          </div>
        </div>
      )}
    </LightboxContext.Provider>
  )
}

/* ------------------------------------------------------------------ */
/* Fotografía con marco y pie de foto                                   */
/* ------------------------------------------------------------------ */

export function Caption({ photo, light = false }: { photo: Photo; light?: boolean }) {
  const meta = [photo.age, photo.year].filter(Boolean).join(' · ')
  if (!photo.title && !meta && !photo.dedication && !photo.description) return null
  return (
    <figcaption className={`px-1 pt-3 text-center ${light ? 'text-white/85' : 'text-navy'}`}>
      {meta && <p className="eyebrow !tracking-[0.22em]">{meta}</p>}
      {photo.title && <p className="mt-1 font-serif text-lg leading-snug">{photo.title}</p>}
      {photo.dedication && <p className="mt-1 font-serif text-base italic leading-snug opacity-75">{photo.dedication}</p>}
      {photo.description && <p className="mt-1 font-sans text-[0.8rem] leading-relaxed opacity-70">{photo.description}</p>}
    </figcaption>
  )
}

/**
 * Fotografía enmarcada. Conserva la proporción original (vertical, horizontal o cuadrada),
 * así que nunca recorta rostros. Al tocarla se abre en pantalla completa.
 */
export function PhotoFrame({
  photos,
  index,
  className = '',
  eager = false,
  caption = true,
}: {
  photos: Photo[]
  index: number
  className?: string
  eager?: boolean
  caption?: boolean
}) {
  const open = useLightbox()
  const photo = photos[index]
  return (
    <figure className={className}>
      <button
        type="button"
        onClick={() => open(photos, index)}
        aria-label={`Ampliar fotografía${photo.title ? `: ${photo.title}` : ''}`}
        className="frame block w-full cursor-zoom-in"
      >
        <img
          src={photo.src}
          alt={photo.title || 'Fotografía de Chrystofer'}
          width={photo.width}
          height={photo.height}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          draggable={false}
          className="block h-auto w-full bg-sky/40"
          style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
        />
      </button>
      {caption && <Caption photo={photo} />}
    </figure>
  )
}

/* ------------------------------------------------------------------ */
/* Álbum (mosaico de dos columnas)                                      */
/* ------------------------------------------------------------------ */

export function Album({ photos }: { photos: Photo[] }) {
  if (!photos.length) return null
  return (
    <div className="mx-auto max-w-2xl columns-2 gap-4 px-1 sm:gap-6">
      {photos.map((p, i) => (
        <PhotoFrame
          key={p.id}
          photos={photos}
          index={i}
          className={`mb-5 break-inside-avoid ${i % 3 === 0 ? '-rotate-1' : i % 3 === 1 ? 'rotate-1' : ''}`}
        />
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Carrusel manual (deslizar con el dedo o usar las flechas)            */
/* ------------------------------------------------------------------ */

export function Carousel({ photos, label }: { photos: Photo[]; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  if (!photos.length) return null
  const move = (d: number) => {
    const el = ref.current
    if (el) el.scrollBy({ left: d * el.clientWidth * 0.8, behavior: 'smooth' })
  }
  if (photos.length === 1) return <PhotoFrame photos={photos} index={0} className="mx-auto w-[min(78%,20rem)]" />
  return (
    <div role="group" aria-label={label}>
      <div
        ref={ref}
        className="no-scrollbar flex snap-x snap-mandatory items-center gap-4 overflow-x-auto scroll-smooth px-[9%] py-2"
      >
        {photos.map((p, i) => (
          <PhotoFrame
            key={p.id}
            photos={photos}
            index={i}
            className={`shrink-0 snap-center ${p.width > p.height ? 'w-[82%] max-w-md' : 'w-[68%] max-w-[19rem]'}`}
          />
        ))}
      </div>
      <div className="mt-3 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => move(-1)}
          aria-label="Fotografías anteriores"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-navy/20 bg-white text-navy hover:border-navy"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="font-sans text-[0.7rem] uppercase tracking-[0.25em] text-navy/50">Desliza</span>
        <button
          type="button"
          onClick={() => move(1)}
          aria-label="Fotografías siguientes"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-navy/20 bg-white text-navy hover:border-navy"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
