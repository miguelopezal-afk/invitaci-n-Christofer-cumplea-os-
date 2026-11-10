export type SectionId = 'portada' | 'primeros' | 'infancia' | 'adolescencia' | 'actual' | 'final'

export const SECTIONS: { id: SectionId; label: string; hint: string }[] = [
  { id: 'portada', label: 'Portada', hint: 'Se usa la primera fotografía de este grupo.' },
  { id: 'primeros', label: 'Primeros años', hint: 'Bebé y primera infancia (álbum).' },
  { id: 'infancia', label: 'Infancia', hint: 'Línea del tiempo.' },
  { id: 'adolescencia', label: 'Adolescencia', hint: 'Línea del tiempo.' },
  { id: 'actual', label: 'Etapa actual', hint: 'Sección "Los sueños también crecen".' },
  { id: 'final', label: 'Fotografía final', hint: 'Se usa la primera fotografía de este grupo.' },
]

export interface Photo {
  id: string
  /** Ruta relativa a la carpeta public/, p. ej. "photos/foto-abc.webp". */
  src: string
  section: SectionId
  width: number
  height: number
  title?: string
  age?: string
  year?: string
  dedication?: string
  description?: string
}

export interface TimelineGroup {
  section: SectionId
  /** Edad o año opcional, p. ej. "6 a 12 años". */
  label: string
  title: string
  description: string
  /** Pasaje del cuento que se muestra justo antes de esta etapa (opcional). */
  story?: string
}

export interface Content {
  /** Versión de los textos; el editor la usa para detectar borradores y ZIP antiguos. */
  version?: number
  celebrant: { name: string; firstName: string; age: number }
  event: { type: string; dateLabel: string; time: string; venue: string; address: string }
  texts: Record<string, string>
  timeline: TimelineGroup[]
  photos: Photo[]
}

export const bySection = (photos: Photo[], section: SectionId) =>
  photos.filter((p) => p.section === section)
