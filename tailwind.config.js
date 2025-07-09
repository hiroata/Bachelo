/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bbs-bg': '#333333',
        'bbs-content': '#f0f0e0',
        'bbs-link': '#0000EE',
        'bbs-name': '#008000',
        'bbs-button': '#e5007f',
        'bbs-region': '#6b8e23',
      },
      fontFamily: {
        'bbs': ['"MS PGothic"', '"Hiragino Kaku Gothic ProN"', '"メイリオ"', 'Meiryo', 'sans-serif'],
      },
      maxWidth: {
        'bbs': '1000px',
      }
    },
  },
  plugins: [],
}