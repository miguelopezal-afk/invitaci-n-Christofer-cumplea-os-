/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './editor.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sky: '#CDEAF7',
        navy: '#183153',
        cream: '#F8F6F2',
        gold: '#D5B77A',
        golddeep: '#9C7C3C',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
