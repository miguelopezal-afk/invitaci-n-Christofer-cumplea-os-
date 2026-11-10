import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' => rutas relativas: funciona igual en GitHub Pages (subcarpeta) y en Vercel (raíz).
// Solo index.html entra en la versión pública; editor.html existe únicamente en `npm run editor`.
export default defineConfig({
  base: './',
  plugins: [react()],
})
