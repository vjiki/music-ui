/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bird-black': '#000000',
        'bird-gray': '#1a1a1a',
        'bird-dark': '#0a0a0a',
      },
    },
  },
  plugins: [],
}

