/** Glifo de WhatsApp (24 × 24). */
const WHATSAPP =
  'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z'

/**
 * Botón-ilustración: la bata blanca, dentro de un medallón, es el botón.
 * La campana del estetoscopio lleva el glifo de WhatsApp; al tocarlo se abre
 * WhatsApp con el mensaje y el enlace de la invitación listos para enviar.
 * `caption` es una inscripción opcional que rodea el medallón por arriba, como en un sello.
 */
export function CoatShareButton({ label, message, caption }: { label: string; message: string; caption?: string }) {
  const url = window.location.href.split('#')[0]

  return (
    <a
      href={`https://wa.me/?text=${encodeURIComponent(`${message} ${url}`)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="coat-share group inline-flex max-w-full flex-col items-center rounded-3xl px-3 pb-2.5 pt-1.5 text-navy"
    >
      <span className="relative block transition-transform duration-200 ease-out group-active:scale-[0.97]">
        {/* Sombra del medallón: lo levanta del papel y se recoge al pulsar */}
        <span
          className="absolute inset-x-[0.8%] bottom-[0.7%] aspect-square rounded-full shadow-[0_16px_28px_-16px_rgba(24,49,83,0.55)] transition-shadow duration-200 group-active:shadow-[0_6px_12px_-8px_rgba(24,49,83,0.55)]"
          aria-hidden="true"
        />
        <svg
          viewBox={caption ? '-32 -30 264 294' : '-32 0 264 264'}
          aria-hidden="true"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`relative w-44 ${caption ? 'h-[12.25rem]' : 'h-44'}`}
        >
          {/* Inscripción en arco sobre el medallón */}
          {caption && (
            <>
              <path id="coat-arc" d="M-42 132a142 142 0 0 1 284 0" />
              <text className="fill-golddeep font-sans text-[15.5px] font-medium uppercase tracking-[0.3em]">
                <textPath href="#coat-arc" startOffset="50%" textAnchor="middle">
                  {caption}
                </textPath>
              </text>
            </>
          )}
          {/* Medallón: aro fino dorado y disco celeste */}
          <circle
            cx="100"
            cy="132"
            r="130"
            fill="#fff"
            strokeWidth="1.2"
            className="stroke-gold transition-colors duration-200 group-hover:stroke-golddeep"
          />
          <circle
            cx="100"
            cy="132"
            r="123"
            className="fill-sky/50 transition-colors duration-200 group-hover:fill-sky/75 group-active:fill-sky"
          />

          {/* Bata larga */}
          <g stroke="#183153" strokeWidth="1.6">
            <path
              d="M84 30C73 35 60 38 50 44L22 160l19 7L60 88l-3 148h86l-3-148 19 79 19-7L150 44c-10-6-23-9-34-14"
              fill="#fff"
            />
            <path d="M84 30q16-9 32 0l-16 76z" className="fill-sky/50" />
            <path d="M84 30 67 66l14 6 19 34M116 30l17 36-14 6-19 34" fill="#fff" />
            <path d="M100 106v130" />
            <rect x="64" y="194" width="25" height="27" rx="2" />
            <rect x="111" y="194" width="25" height="27" rx="2" />
            <path d="M113 132h21v18h-21z" />
          </g>
          <g fill="#183153">
            <circle cx="106" cy="142" r="2" />
            <circle cx="106" cy="165" r="2" />
            <circle cx="106" cy="188" r="2" />
          </g>

          {/* Estetoscopio: su campana es el botón de WhatsApp */}
          <g stroke="#C9A961" strokeWidth="2.2">
            <path d="M84 33c-18 30-16 80 16 93 32-13 34-63 16-93" />
            <g transform="translate(100 126)">
              <g className="coat-steth">
                <path d="M0 0c2 13-25 5-28 19" />
                <circle cx="-28" cy="40" r="21" fill="#183153" />
                <path d={WHATSAPP} transform="translate(-40.6 27.4) scale(1.05)" fill="#fff" stroke="none" />
              </g>
            </g>
          </g>
        </svg>
      </span>

      <span className="mt-4 inline-flex items-center gap-2 border-b border-gold pb-1.5 font-sans text-sm font-medium tracking-wide transition-colors duration-200 group-hover:border-navy">
        <span className="text-balance text-center">{label}</span>
        <span className="sr-only"> (opens WhatsApp)</span>
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        >
          <path d="M7 7h10v10M7 17 17 7" />
        </svg>
      </span>
    </a>
  )
}
