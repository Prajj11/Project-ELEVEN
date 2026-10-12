/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pitch: {
          dark: '#0f381e',
          DEFAULT: '#15803d',
          light: '#22c55e',
        },
        team: {
          blue: '#0284c7',
          'blue-light': '#38bdf8',
          red: '#e11d48',
          'red-light': '#fb7185',
        }
      }
    },
  },
  plugins: [],
};
