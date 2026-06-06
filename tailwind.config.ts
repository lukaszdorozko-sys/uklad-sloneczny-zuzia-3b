import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        space: {
          950: '#03050b',
          900: '#090d16',
          800: '#111724',
          700: '#1c2638',
        },
        aurora: {
          400: '#56d7c5',
          500: '#2ab6a6',
        },
        solar: {
          300: '#ffe08a',
          500: '#ffb13b',
        },
      },
      boxShadow: {
        panel: '0 22px 70px rgba(0, 0, 0, 0.45)',
        glow: '0 0 32px rgba(86, 215, 197, 0.32)',
      },
    },
  },
  plugins: [],
} satisfies Config;
