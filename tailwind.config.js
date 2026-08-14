/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'bg-light': '#0D0D0D',
        'bg-dark': '#000000',
        'text-dark': '#000000',
        'text-light': '#FFFFFF',
        accent: '#FF4D4D',
        'border-light': 'rgba(255, 255, 255, 0.1)',
        'gray-secondary': '#9CA3AF',
      },
      fontFamily: {
        sans: ['"JetBrains Mono"', 'ui-monospace', 'Consolas', 'monospace'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'Consolas', 'monospace'],
      },
      scale: {
        102: '1.02',
        108: '1.08',
      },
      transitionDuration: {
        400: '400ms',
        600: '600ms',
        800: '800ms',
        1200: '1200ms',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        drawLine: {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-6px)' },
          '75%': { transform: 'translateX(6px)' },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp 0.6s ease-out forwards',
        drawLine: 'drawLine 2.5s ease-in-out forwards',
        shake: 'shake 0.4s ease-in-out',
      },
      transitionTimingFunction: {
        resize: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
