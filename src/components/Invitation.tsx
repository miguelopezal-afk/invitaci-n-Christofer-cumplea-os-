import { useState } from 'react'
import { CalendarDays, Check, ChevronDown, Clock, MapPin, Navigation, Share2 } from 'lucide-react'
import { bySection, type Content } from '../lib/types'
import { Album, Caption, Carousel, LightboxProvider, PhotoFrame } from './Gallery'
import { Divider, Reveal, Sparkle, WhiteCoat } from './ui'

/** La invitación completa. Recibe todo su contenido por props (content.json). */
export default function Invitation({ content }: { content: Content }) {
  const { celebrant, event, texts: t, photos, timeline } = content
  const cover = bySection(photos, 'portada').slice(0, 1)
  const early = bySection(photos, 'primeros')
  const current = bySection(photos, 'actual')
  const final = bySection(photos, 'final').slice(0, 1)

  return (
    <LightboxProvider>
      <main className="overflow-x-hidden">
        {/* 1 · PORTADA ------------------------------------------------ */}
        <section className="relative flex min-h-[100svh] flex-col items-center justify-center bg-white px-6 pb-14 pt-12 text-center">
          <div className="pointer-events-none absolute inset-3 border border-gold/50" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-sky/50 to-transparent" aria-hidden="true" />
          <Sparkle className="absolute left-[12%] top-[9%] h-4 w-4 text-gold" />
          <Sparkle className="absolute right-[13%] top-[15%] h-2.5 w-2.5 text-gold" />
          <Sparkle className="absolute right-[20%] top-[7%] h-3 w-3 text-sky" />
          <Sparkle className="absolute left-[20%] top-[19%] h-2 w-2 text-sky" />

          <div className="relative w-full max-w-md">
            <p className="eyebrow">{event.type}</p>
            <p
              className="mt-2 font-display text-[clamp(7rem,38vw,11rem)] leading-[0.9] text-gold"
              aria-hidden="true"
            >
              {celebrant.age}
            </p>
            <h1 className="mt-1 font-serif text-[clamp(2rem,9vw,2.75rem)] italic leading-tight text-navy">
              {t.heroTitle}
            </h1>
            <p className="mt-3 font-display text-[clamp(1.35rem,6.4vw,1.9rem)] uppercase tracking-[0.22em] text-navy">
              {celebrant.name}
            </p>
            <Divider className="my-6" />
            {cover.length > 0 && (
              <div className="relative mx-auto w-[min(72%,17rem)]">
                <div className="absolute inset-0 translate-x-2.5 translate-y-2.5 border border-gold" aria-hidden="true" />
                <PhotoFrame photos={cover} index={0} eager caption={false} className="relative" />
              </div>
            )}
            <p className="lead mx-auto mt-8 max-w-xs">{t.heroSubtitle}</p>
            <a href="#historia" className="btn-primary mt-8">
              {t.heroButton}
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </section>

        {/* EL CUENTO · prólogo ---------------------------------------- */}
        <div id="historia" />
        {t.story1 && (
          <section className="bg-sky/30 px-6 py-20">
            <Reveal className="mx-auto max-w-md text-center">
              {t.storyEyebrow && <p className="font-serif text-2xl italic text-golddeep">{t.storyEyebrow}</p>}
              {t.storyTitle && <h2 className="section-title mt-3">{t.storyTitle}</h2>}
              <Divider className="my-7" />
              <Story text={t.story1} dropCap />
            </Reveal>
          </section>
        )}

        {/* 2 · LOS PRIMEROS AÑOS -------------------------------------- */}
        <section className="bg-cream px-5 py-20">
          <Reveal className="mx-auto max-w-xl text-center">
            <p className="eyebrow">Los primeros años</p>
            <h2 className="section-title mt-3">{t.earlyTitle}</h2>
            <Divider className="my-6" />
            <p className="lead">{t.earlyText}</p>
          </Reveal>
          <Reveal className="mt-12">
            <Album photos={early} />
          </Reveal>
        </section>

        {/* 3 · CRECIENDO ENTRE RECUERDOS ------------------------------ */}
        <section className="bg-white py-20">
          <Reveal className="mx-auto max-w-xl px-5 text-center">
            <p className="eyebrow">Creciendo entre recuerdos</p>
            <h2 className="section-title mt-3">{t.growingTitle}</h2>
            <Divider className="my-6" />
            <p className="lead">{t.growingText}</p>
          </Reveal>
          {t.story2 && (
            <Reveal className="mx-auto mt-12 max-w-md px-6">
              <Story text={t.story2} framed />
            </Reveal>
          )}

          <ol className="mx-auto mt-6 max-w-2xl">
            {timeline.map((group) => {
              const list = bySection(photos, group.section)
              if (!list.length && !group.description) return null
              // Si la primera fotografía es horizontal, se muestra grande; el resto, en dos columnas.
              const lead = list.length > 2 && list[0].width > list[0].height ? list.slice(0, 1) : []
              const rest = list.slice(lead.length)
              return (
                <li key={group.section}>
                  <Reveal>
                    <div className="text-center">
                      <span className="mx-auto block h-14 w-px bg-gold/60" aria-hidden="true" />
                      <span className="mx-auto my-4 block h-2.5 w-2.5 rotate-45 bg-gold" aria-hidden="true" />
                      {group.label && <p className="eyebrow mb-1">{group.label}</p>}
                      <h3 className="font-display text-[1.7rem] text-navy">{group.title}</h3>
                      {group.description && (
                        <p className="mx-auto mt-2 max-w-md px-6 font-serif text-lg leading-relaxed text-navy/75">
                          {group.description}
                        </p>
                      )}
                    </div>
                    <div className="mt-7 space-y-5 px-5 pb-10">
                      {lead.length > 0 && <PhotoFrame photos={list} index={0} className="mx-auto max-w-2xl px-1" />}
                      <Album photos={rest} tilt={false} offset={lead.length} all={list} />
                    </div>
                  </Reveal>
                </li>
              )
            })}
          </ol>
        </section>

        {/* 4 · SUEÑOS Y NUEVOS CAMINOS -------------------------------- */}
        <section className="bg-gradient-to-b from-sky/45 via-cream to-cream py-20">
          <Reveal className="mx-auto max-w-xl px-5 text-center">
            <p className="eyebrow">Sueños y nuevos caminos</p>
            <h2 className="section-title mt-3">{t.dreamsTitle}</h2>
            <Divider className="my-6" />
            <p className="lead">{t.dreamsText}</p>
          </Reveal>
          <Reveal className="mt-10">
            <Carousel photos={current} label="Fotografías de su etapa actual" />
          </Reveal>
          {t.story3 && (
            <Reveal className="mx-auto mt-14 max-w-md px-6">
              <Story text={t.story3} framed />
            </Reveal>
          )}
          <Reveal className="mx-auto mt-12 flex max-w-xs flex-col items-center px-5 text-center">
            <WhiteCoat className="h-36 w-auto" />
            {t.dreamsNote && <p className="mt-4 font-serif text-lg italic text-navy/70">{t.dreamsNote}</p>}
          </Reveal>
        </section>

        {/* 5 · EL GRAN MOMENTO ---------------------------------------- */}
        <section className="relative bg-navy px-6 py-24 text-center text-white">
          <div className="pointer-events-none absolute inset-3 border border-gold/40" aria-hidden="true" />
          <Reveal className="relative mx-auto max-w-md">
            <Sparkle className="mx-auto h-4 w-4 text-gold" />
            {final.length > 0 && (
              <figure className="mx-auto mt-8 w-[min(80%,19rem)]">
                <div className="relative">
                  <div className="absolute -inset-2.5 border border-gold/80" aria-hidden="true" />
                  <PhotoFrame photos={final} index={0} caption={false} className="relative" />
                </div>
                <div className="mt-4">
                  <Caption photo={final[0]} light />
                </div>
              </figure>
            )}
            <p className="mt-10 whitespace-pre-line font-serif text-[1.45rem] italic leading-relaxed text-white/90">
              {t.momentText}
            </p>
            <Divider className="my-8" />
            <p className="font-display text-[clamp(1.7rem,7.5vw,2.3rem)] leading-tight text-gold">{t.momentClosing}</p>
          </Reveal>
        </section>

        {/* 6 · INVITACIÓN FINAL --------------------------------------- */}
        <section className="bg-cream px-4 py-20">
          <Reveal className="mx-auto max-w-lg">
            <div className="border border-gold bg-white p-2 shadow-[0_24px_60px_-40px_rgba(24,49,83,0.5)]">
              <div className="border border-gold/50 px-5 py-12 text-center sm:px-10">
                <p className="eyebrow">{event.type}</p>
                <h2 className="mt-4 font-display text-[clamp(1.6rem,7vw,2.2rem)] uppercase leading-tight tracking-[0.06em] text-navy">
                  {t.inviteTitle}
                </h2>
                <p className="mt-4 font-serif text-2xl italic tracking-wide text-golddeep">{celebrant.name}</p>
                <Divider className="my-7" />
                <p className="lead mx-auto max-w-sm">{t.inviteText}</p>

                <dl className="mx-auto mt-9 max-w-xs space-y-6 text-center">
                  <Detail icon={<CalendarDays className="h-5 w-5" />} label="Fecha" value={event.dateLabel} />
                  {event.time.trim() && (
                    <Detail icon={<Clock className="h-5 w-5" />} label="Hora" value={event.time} />
                  )}
                  <Detail
                    icon={<MapPin className="h-5 w-5" />}
                    label="Lugar"
                    value={event.venue}
                    extra={event.address}
                  />
                </dl>

                <div className="mt-10 flex flex-col gap-3">
                  <a
                    className="btn-primary"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${event.venue}, ${event.address}`,
                    )}`}
                  >
                    <Navigation className="h-4 w-4" aria-hidden="true" />
                    Cómo llegar
                  </a>
                  <ShareButton title={`${celebrant.name} — ¡${celebrant.age} años!`} text={t.inviteTitle} />
                </div>

                <p className="mt-10 font-serif text-xl italic leading-snug text-navy">{t.inviteClosing}</p>
              </div>
            </div>
          </Reveal>
          <p className="mt-10 text-center font-sans text-[0.7rem] uppercase tracking-[0.3em] text-navy/40">
            {celebrant.name} · {celebrant.age} años
          </p>
        </section>
      </main>
    </LightboxProvider>
  )
}

/** Pasaje del cuento, con letra capital opcional. */
function Story({ text, dropCap = false, framed = false }: { text: string; dropCap?: boolean; framed?: boolean }) {
  return (
    <div className={framed ? 'border-y border-gold/60 py-7' : ''}>
      {framed && <Sparkle className="mx-auto mb-4 h-3 w-3 text-gold" />}
      <p
        className={`whitespace-pre-line font-serif text-[1.3rem] italic leading-relaxed text-navy/85 ${
          dropCap
            ? 'text-left first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-[3.6rem] first-letter:not-italic first-letter:leading-[0.8] first-letter:text-golddeep'
            : 'text-center'
        }`}
      >
        {text}
      </p>
    </div>
  )
}

function Detail({ icon, label, value, extra }: { icon: React.ReactNode; label: string; value: string; extra?: string }) {
  return (
    <div>
      <dt className="flex flex-col items-center gap-2">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sky/60 text-navy" aria-hidden="true">
          {icon}
        </span>
        <span className="eyebrow">{label}</span>
      </dt>
      <dd className="mt-1.5 font-serif text-[1.35rem] leading-snug text-navy">
        {value}
        {extra && <span className="mt-1 block font-sans text-sm leading-relaxed text-navy/65">{extra}</span>}
      </dd>
    </div>
  )
}

function ShareButton({ title, text }: { title: string; text: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = url
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const share = async () => {
    const url = window.location.href.split('#')[0]
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
        return
      } catch (e) {
        if ((e as DOMException).name === 'AbortError') return
      }
    }
    await copy(url)
  }

  return (
    <button type="button" onClick={share} className="btn-outline">
      {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Share2 className="h-4 w-4" aria-hidden="true" />}
      <span aria-live="polite">{copied ? 'Enlace copiado' : 'Compartir invitación'}</span>
    </button>
  )
}
