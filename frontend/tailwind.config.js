/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkText: '#1A1A2E',
        saffron: '#FF6B35',
        gold: '#F7C948',
        cardBg: 'rgba(255, 255, 255, 0.85)',
        cardBorder: 'rgba(247, 201, 72, 0.4)'
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
