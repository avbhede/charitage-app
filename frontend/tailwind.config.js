/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#16225B', // Navy Blue from logo
          foreground: '#F8FAFC',
        },
        secondary: {
          DEFAULT: '#E31A22', // Red from logo
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#41A5D0', // Light blue from logo
          foreground: '#FFFFFF',
        },
        background: {
          DEFAULT: '#FDFBF7',
          paper: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#F1F5F9',
          foreground: '#64748B',
        },
        border: '#E2E8F0',
        input: '#E2E8F0',
        ring: '#16225B',
      },
      fontFamily: {
        heading: ['Merriweather', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0,0,0,0.08)',
        'card-hover': '0 12px 24px rgba(0,0,0,0.12)',
        'button': '0 10px 15px -3px rgba(22, 34, 91, 0.2)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}