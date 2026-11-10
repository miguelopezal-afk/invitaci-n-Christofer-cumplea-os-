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
          className="lb-in fixed inset-0 z-50 flex flex-col bg-[#0d1c30]/95"
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
              className="lb-zoom max-h-full max-w-full object-contain"
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
        className="frame block w-full cursor-zoom-in transition-transform duration-200 active:scale-[0.98]"
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
/* Carrusel manual (deslizar con el dedo o usar las flechas)            */
/* ------------------------------------------------------------------ */

export function Carousel({ photos, label }: { photos: Photo[]; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  // Efecto de foco: la fotografía centrada se ve completa y nítida; las vecinas,
  // un poco más pequeñas y tenues. Sigue al dedo mientras se desliza.
  useEffect(() => {
    const el = ref.current
    if (!el || photos.length < 2) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    const update = () => {
      raf = 0
      const mid = el.scrollLeft + el.clientWidth / 2
      let best = 0
      let bestDist = Infinity
      Array.from(el.children).forEach((child, i) => {
        const item = child as HTMLElement
        const dist = Math.abs(item.offsetLeft + item.offsetWidth / 2 - mid)
        if (dist < bestDist) (bestDist = dist), (best = i)
        if (reduce) return
        const t = Math.min(1, dist / el.clientWidth)
        item.style.transform = `scale(${1 - 0.12 * t})`
        item.style.opacity = String(1 - 0.4 * t)
      })
      setActive(best)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    el.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [photos.length])

  if (!photos.length) return null
  if (photos.length === 1) return <PhotoFrame photos={photos} index={0} className="mx-auto w-[min(78%,20rem)]" />

  const go = (i: number) => {
    const el = ref.current
    const item = el?.children[Math.max(0, Math.min(photos.length - 1, i))] as HTMLElement | undefined
    if (el && item) el.scrollTo({ left: item.offsetLeft - (el.clientWidth - item.offsetWidth) / 2, behavior: 'smooth' })
  }
  const arrow =
    'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-navy/20 bg-white text-navy transition hover:border-navy active:scale-90 disabled:opacity-30'

  return (
    <div role="group" aria-label={label}>
      <div
        ref={ref}
        className="no-scrollbar relative flex snap-x snap-mandatory items-center gap-3 overflow-x-auto py-4"
      >
        {photos.map((p, i) => (
          <PhotoFrame
            key={p.id}
            photos={photos}
            index={i}
            className={`shrink-0 snap-center will-change-transform ${
              p.width > p.height
                ? 'w-[82%] max-w-md first:ml-[9%] last:mr-[9%]'
                : 'w-[68%] max-w-[19rem] first:ml-[16%] last:mr-[16%]'
            }`}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center justify-center gap-4 px-4">
        <button type="button" onClick={() => go(active - 1)} disabled={active === 0} aria-label="Fotografía anterior" className={arrow}>
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {photos.map((p, i) => (
            <span
              key={p.id}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? 'w-5 bg-gold' : 'w-1.5 bg-navy/20'}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(active + 1)}
          disabled={active === photos.length - 1}
          aria-label="Fotografía siguiente"
          className={arrow}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        Fotografía {active + 1} de {photos.length}
      </p>
    </div>
  )
}
