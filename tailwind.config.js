/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand:  '#F7931A',  // Bitcoin Orange
        accent: '#A1259A',  // Kraken Purple
      },
    },
  },
  plugins: [],};
