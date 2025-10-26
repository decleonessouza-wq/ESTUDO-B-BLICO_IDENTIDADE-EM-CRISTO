// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    // 1. Escaneia arquivos .tsx na raiz (ex: index.tsx, App.tsx)
    "./*.{js,ts,jsx,tsx}",
    // 2. Escaneia todas as subpastas (components, screens, context, hooks)
    "./**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}