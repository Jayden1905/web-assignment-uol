/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./public/**/*.{ejs,js}', './views/**/*.{js,ejs}'],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui'), require('@tailwindcss/typography')],
  daisyui: {
    themes: ['light', 'dark', 'nord', 'lofi'],
  },
}
