# Chrystofer Woc — ¡22 años!

Invitación digital de cumpleaños: una página estática (React + TypeScript + Vite + Tailwind CSS) que cuenta
22 años de historia en fotografías y termina con la invitación a la celebración.

- **Sin backend, sin base de datos, sin analítica, sin servicios externos.** Las tipografías van incluidas en el proyecto.
- Pensada primero para teléfonos (se comparte por WhatsApp) y adaptable a tablet y computadora.
- Todo el contenido vive en un solo archivo: `src/content/content.json`.
- Incluye un **editor local** para subir, ordenar y exportar las fotografías. El editor **no se publica**.

> **Privacidad.** GitHub Pages (y Vercel) son alojamientos **públicos**: cualquier persona que tenga la URL de la
> página o de una imagen podrá verla, y el repositorio conserva el historial de lo que subas. Publica solo las
> fotografías que quieras compartir. El proyecto se entrega con fotografías de demostración ficticias; ninguna
> fotografía personal está incluida.

## 1. Instalar dependencias

Necesitas [Node.js](https://nodejs.org) 20 o superior.

```bash
npm install
```

## 2. Ejecutar el proyecto localmente

```bash
npm run dev
```

Abre <http://localhost:5173/>.

## 3. Abrir el editor de fotografías

```bash
npm run editor
```

Se abre <http://localhost:5173/editor.html>. Para usarlo **desde el iPhone**, conecta el teléfono a la misma red
wifi y abre en Safari la dirección `Network` que muestra la terminal, añadiendo `/editor.html`
(por ejemplo `http://192.168.1.20:5173/editor.html`).

El editor solo existe mientras corre ese comando: `npm run build` no lo incluye en la versión pública.

## 4. Subir y ordenar las fotografías

En la pestaña **Fotografías**:

1. Elige la sección de destino (Portada, Primeros años, Infancia, Adolescencia, Etapa actual, Fotografía final).
2. Pulsa **Seleccionar fotografías** y elige varias a la vez.
3. Reordena arrastrando y soltando las tarjetas (o con las flechas ↑ ↓), cámbialas de sección con el selector,
   reemplázalas o elimínalas.
4. **Portada** (botón con estrella) convierte una fotografía en la principal. En *Portada* y *Fotografía final*
   se usa la primera del grupo.
5. En cada tarjeta puedes escribir título, edad aproximada, año, dedicatoria y descripción.

Cada fotografía se copia a una versión optimizada (máx. 1600 px; WebP si el navegador puede generarlo, JPEG si no).
**Los originales no se modifican y nada se sube a ningún servidor.** Se conserva la proporción original, así que
no se recortan rostros.

En **Datos y textos** puedes cambiar la fecha, el lugar, los textos y **la hora** (está vacía; mientras lo esté,
no aparece en la invitación). **Vista previa** muestra el resultado en tamaño de teléfono.

El borrador se guarda automáticamente solo en ese navegador.

## 5. Exportar el álbum

En la pestaña **Exportar**, pulsa **Descargar ZIP**. Contiene:

```
content.json   textos, datos del evento y orden de las fotografías
photos/        fotografías optimizadas
LEEME.txt      estos mismos pasos
```

Como el sitio es estático, el editor no guarda nada en GitHub: tú incorporas el ZIP al proyecto (paso 6).
Para seguir editando otro día o en otro dispositivo, usa **Abrir un ZIP exportado**.

## 6. Incorporar los archivos al proyecto

1. Descomprime el ZIP.
2. Borra el contenido de `public/photos/` y copia ahí los archivos de la carpeta `photos/` del ZIP.
3. Reemplaza `src/content/content.json` por el `content.json` del ZIP.
4. Comprueba el resultado con `npm run dev`.

## 7. Publicar en GitHub Pages

Una sola vez: en GitHub, **Settings → Pages → Build and deployment → Source: GitHub Actions**.

Después, cada `push` a la rama `main` publica la página automáticamente (`.github/workflows/deploy.yml`):

```bash
git add -A
git commit -m "Actualizar álbum"
git push
```

La dirección será `https://miguelopezal-afk.github.io/invitaci-n-Christofer-cumplea-os-/`.
Si la dirección final es otra (otro nombre de repositorio, dominio propio o Vercel), cámbiala en el archivo `.env`
(`VITE_SITE_URL`, terminada en `/`): WhatsApp la necesita para mostrar la imagen de portada.

### Vercel (alternativa)

Importa el repositorio en Vercel; detecta Vite automáticamente (build `npm run build`, salida `dist`).
En *Environment Variables* define `VITE_SITE_URL` con la URL que te asigne Vercel.

## 8. Actualizar la invitación

- **Fotografías u orden:** repite los pasos 3 a 7.
- **Textos, fecha, hora, lugar:** desde el editor, o edita directamente `src/content/content.json` y haz `push`.

## 9. Compartir el enlace por WhatsApp

Pega la dirección de la página en un chat. WhatsApp mostrará la tarjeta de la bata con el título «Chrystofer Woc — ¡22 años!»
(`public/og-image.png`). Si antes compartiste el enlace y no se actualiza la vista previa, añade `?v=2` al final.
Dentro de la invitación, el botón **Compartir invitación** abre el menú de compartir del teléfono (o copia el enlace).

## Estructura

```
index.html                 página pública (metadatos Open Graph)
editor.html                editor local (no se publica)
public/photos/             fotografías que usa la invitación
public/og-image.png        portada para WhatsApp
src/content/content.json   configuración: nombre, edad, evento, textos, fotografías y su orden
src/components/            Invitation (6 secciones), Gallery (carrusel, pantalla completa), ui
src/editor/                editor de fotografías y exportación ZIP
```
