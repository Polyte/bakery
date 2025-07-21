/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        josefin: ['"Josefin Sans"', 'sans-serif'],
      },
      colors: {
        'dadda-primary': '#81a969', // Example green
        'dadda-primary-dark': '#6b8e57', // Example darker green
        'brown-extra-dark': '#2E1A12', // Example extra dark brown
        'brown-dark': '#4F2D20', // Example dark brown
        'brown': '#7C4F32', // Example brown
        'brown-medium': '#A47551', // Example medium brown
        'brown-light': '#D2B48C', // Example light brown
        'pink-light': '#FFE4EC', // Example light pink for backgrounds
      },
    },
  },
  plugins: [],
} 