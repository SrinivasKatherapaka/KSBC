/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Archivo Black"', 'sans-serif'],
        archivo: ['"Archivo Black"', 'sans-serif'],
        sans: ['Inter', 'Archivo', 'sans-serif'],
      },
      colors: {
        ksbc: {
          50: '#FAF7E6',  // Warm Ivory / Cream Brand Background
          100: '#F5F1DA',
          200: '#EAE3C2',
          300: '#D5C99B',
          400: '#B8A66E',
          500: '#9C884B',
          600: '#7E6B34',
          700: '#5F4F24',
          800: '#2E3B5E',
          900: '#1E2748', // Deep KSBC Brand Navy
          950: '#141C33', // Deepest Obsidian Navy
          bg: '#FAF7E6',
          navy: '#1E2748',
          'navy-dark': '#141C33',
          'navy-light': '#2A3B66',
          'navy-border': 'rgba(30, 39, 72, 0.15)',
          surface: '#FFFFFF',
          'surface-card': '#FFFDF9',
          'surface-soft': '#F7F4E9',
          gold: '#C59E5F',
          'gold-light': '#DFBD84',
          'gold-dark': '#A68249',
          'text-primary': '#1E2748',
          'text-secondary': '#53627C',
          'text-muted': '#7E8DA4',
          'text-navy': '#1E2748'
        }
      }
    },
  },
  plugins: [],
}
