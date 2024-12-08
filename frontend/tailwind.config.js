/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,css}'
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#754a59',
        'hurt': 'rgba(228, 56, 53, 0.4)',
      },
      fontFamily: {
        'primary': ['"blesseaster"', 'sans-serif'],
      },
      dropShadow: {
        'classic': '0px 0px 4px #754a59',
      },
    },
  },
  plugins: [],
}

