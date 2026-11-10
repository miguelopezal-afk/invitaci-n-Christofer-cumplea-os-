import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './fonts'
import './index.css'
import raw from './content/content.json'
import Invitation from './components/Invitation'
import type { Content } from './lib/types'

// Las rutas de las fotografías son relativas a public/; BASE_URL las hace válidas
// tanto en GitHub Pages (subcarpeta) como en Vercel (raíz).
const data = raw as Content
const content: Content = {
  ...data,
  photos: data.photos.map((p) => ({ ...p, src: import.meta.env.BASE_URL + p.src })),
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Invitation content={content} />
  </StrictMode>,
)
