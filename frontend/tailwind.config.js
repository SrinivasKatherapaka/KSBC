/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ksbc: {
          50: '#f7f5ef',
          100: '#ede8d9',
          200: '#dfbd84', // Primary Champagne Brand Gold
          300: '#c59e5f',
          400: '#a68249',
          500: '#876735',
          600: '#684d24',
          700: '#4a3516',
          800: '#2b1e0b',
          900: '#1b2827', // Deep Slate Pine
          950: '#131d1c', // Deepest Obsidian Pine
          gold: '#dfbd84',
          'gold-light': '#eed29e',
          'gold-dark': '#c59e5f',
          pine: '#20302f',
          'pine-dark': '#182423',
          'pine-light': '#2b3f3e',
          'pine-border': '#3d5654',
          'text-primary': '#f4eee2',
          'text-secondary': '#a4b8b5',
          'text-gold': '#dfbd84'
        }
      }
    },
  },
  plugins: [],
}
