/**
 * Dirección que se comparte: sin #ancla y sin parámetros de seguimiento (fbclid, utm_…).
 * Solo se conserva ?v=, que sirve para que WhatsApp vuelva a generar la vista previa.
 */
export function shareUrl(): string {
  const u = new URL(window.location.href)
  const v = u.searchParams.get('v')
  u.hash = ''
  u.search = v ? `?v=${encodeURIComponent(v)}` : ''
  return u.href
}
