/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#d9e6ff',
          200: '#b8d0ff',
          300: '#8ab1ff',
          400: '#5a8bff',
          500: '#3466fa',
          600: '#2049ef',
          700: '#1c39d6',
          800: '#1d31ac',
          900: '#1c2e88',
          950: '#151c50',
        },
        surface: {
          DEFAULT: '#0b1120',
          card: '#111827',
          border: '#1f2937',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(0 0 0 / 0.06), 0 1px 3px 0 rgb(0 0 0 / 0.08)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.10)',
        glow: '0 0 0 1px rgb(52 102 250 / 0.15), 0 4px 24px -4px rgb(52 102 250 / 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.15s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        scaleIn: { '0%': { opacity: 0, transform: 'scale(0.97)' }, '100%': { opacity: 1, transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
}
