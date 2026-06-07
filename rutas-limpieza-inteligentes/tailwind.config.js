/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#135C3A',
          dark: '#0A3B24',
          light: '#E6F4EA',
        },
        surface: {
          DEFAULT: '#F8F9FA',
          card: '#FFFFFF',
        },
        text: {
          main: '#1A1D1F',
          muted: '#6F767E',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'card': '0px 2px 10px rgba(0, 0, 0, 0.02)',
      },
      fontSize: {
        'xxs': '0.65rem',
      },
    },
  },
  plugins: [],
}
