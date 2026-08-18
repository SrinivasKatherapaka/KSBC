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
          50: '#FAF7E6',  // Warm Ivory Text Accent
          100: '#F5F1DA',
          200: '#DFBD84', // KSBC Champagne Gold
          300: '#C59E5F',
          400: '#A68249',
          500: '#876735',
          600: '#684D24',
          700: '#4A3516',
          800: '#182442',
          900: '#0F172A', // Deep Midnight Navy
          950: '#0B1120', // Base Midnight Navy Background
          bg: '#0B1120',
          'bg-dark': '#070C18',
          navy: '#0F172A',
          'navy-card': '#15203B',
          'navy-surface': '#182442',
          'navy-border': 'rgba(223, 189, 132, 0.2)',
          gold: '#DFBD84',
          'gold-light': '#EED29E',
          'gold-dark': '#C59E5F',
          'text-primary': '#FAF7E6',
          'text-secondary': '#94A3B8',
          'text-gold': '#DFBD84',
          'text-muted': '#64748B'
        }
      }
    },
  },
  plugins: [],
}
