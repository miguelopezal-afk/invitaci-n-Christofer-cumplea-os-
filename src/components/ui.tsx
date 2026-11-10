import { useEffect, useRef, type ReactNode } from 'react'

/** Envuelve contenido y lo hace aparecer suavemente al entrar en pantalla. */
export function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      el.classList.add('is-in')
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.classList.add('is-in')
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  )
}

/** Estrella de cuatro puntas, decorativa. */
export function Sparkle({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M12 0c.6 6.6 4.4 11.4 12 12-7.6.6-11.4 5.4-12 12-.6-6.6-4.4-11.4-12-12 7.6-.6 11.4-5.4 12-12z" />
    </svg>
  )
}

/** Divisor fino dorado con una estrella al centro. */
export function Divider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-gold ${className}`} aria-hidden="true">
      <span className="h-px w-14 bg-gold/70" />
      <Sparkle className="h-2.5 w-2.5" />
      <span className="h-px w-14 bg-gold/70" />
    </div>
  )
}

/** Ilustración discreta: bata blanca con estetoscopio (símbolo de una nueva etapa). */
export function WhiteCoat({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 236"
      className={className}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Ilustración de una bata blanca con estetoscopio"
    >
      <g stroke="#183153" strokeWidth="1.6">
        <path
          d="M82 26 58 38 30 56l-9 66 20 4 5-34 1 130h106l1-130 5 34 20-4-9-66-28-18-24-12"
          fill="#fff"
        />
        <path d="M82 26l18 68 18-68" />
        <path d="M82 26 68 60l15 5 17 29M118 26l14 34-15 5-17 29" fill="#fff" />
        <path d="M100 94v128" />
        <rect x="56" y="162" width="30" height="34" rx="2" />
        <rect x="114" y="162" width="30" height="34" rx="2" />
        <path d="M118 108h22v20h-22z" />
      </g>
      <g fill="#183153">
        <circle cx="107" cy="120" r="2" />
        <circle cx="107" cy="148" r="2" />
        <circle cx="107" cy="176" r="2" />
      </g>
      <g stroke="#C9A961" strokeWidth="2.2">
        <path d="M86 30c-12 44-8 82 14 88 22-6 26-44 14-88" />
        <path d="M100 118c0 22-26 14-27 34" />
        <circle cx="73" cy="160" r="8" fill="#fff" />
        <circle cx="73" cy="160" r="3" fill="#C9A961" stroke="none" />
      </g>
    </svg>
  )
}
