/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand:  '#F7931A',  // Bitcoin Orange
        accent: '#A1259A',  // Kraken Purple
      },
    },
  },
  plugins: [],
};