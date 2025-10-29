// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {
      // 1. Definição do Mapeamento de Cores para Etapas (Stages)
      colors: {
        // Etapa 1: Azul Padrão
        'stage-1': 'rgb(37 99 235)', // blue-600 (Accent Bg)
        'stage-1-light': 'rgb(96 165 250)', // blue-400 (Accent Text/Icon)
        'stage-1-dark': 'rgb(29 78 216)', // blue-700 (Card Border)
        
        // Etapa 2: Verde Esmeralda
        'stage-2': 'rgb(16 185 129)', // emerald-600
        'stage-2-light': 'rgb(52 211 163)', // emerald-400
        'stage-2-dark': 'rgb(5 150 105)', // emerald-700

        // Etapa 3: Amarelo
        'stage-3': 'rgb(234 179 8)', // yellow-600
        'stage-3-light': 'rgb(250 204 21)', // yellow-400
        'stage-3-dark': 'rgb(202 138 4)', // yellow-700

        // Etapa 4: Roxo
        'stage-4': 'rgb(147 51 234)', // purple-600
        'stage-4-light': 'rgb(167 139 250)', // purple-400
        'stage-4-dark': 'rgb(126 34 206)', // purple-700

        // Etapa 5: Rosa
        'stage-5': 'rgb(236 72 153)', // pink-600
        'stage-5-light': 'rgb(244 114 182)', // pink-400
        'stage-5-dark': 'rgb(190 24 93)', // pink-700

        // Etapa 6: Laranja
        'stage-6': 'rgb(249 115 22)', // orange-600
        'stage-6-light': 'rgb(251 146 60)', // orange-400
        'stage-6-dark': 'rgb(217 119 6)', // orange-700
      }
    },
  },
  // 2. SAFELIST: Força o Tailwind a gerar todas as classes necessárias
  safelist: [
    // Pattern para cores principais (bg, text, border, ring)
    {
      pattern: /(text|bg|border|ring)-(stage)-(1|2|3|4|5|6)-(light|dark)?/,
    },
    // Pattern para o foco do textarea
    {
      pattern: /(focus:ring)-(stage)-(1|2|3|4|5|6)-(light|dark)?/,
    },
    // Pattern para a barra de progresso (gradiente)
    {
      pattern: /(from|to)-(stage)-(1|2|3|4|5|6)-(light|dark)?/,
    },
  ],
  plugins: [],
}