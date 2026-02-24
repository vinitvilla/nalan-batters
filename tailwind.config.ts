import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#FFD700',
          light: '#fffbe6',
          dark: '#bfa100',
        },
        white: {
          DEFAULT: '#fff',
          off: '#fff9e3',
        },
      },
      boxShadow: {
        'gold-sm': '0 2px 12px 0 rgba(255, 215, 0, 0.10)',
        'gold-lg': '0 4px 32px 0 rgba(255,215,0,0.08)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(90deg, #FFD700 30%, #fff 100%)',
        'gold-card': 'linear-gradient(to-br, #fffbe6, #fff9e3, #fff)',
        'gold-btn': 'linear-gradient(to-r, #FFD700, #fffbe6)',
      },
      fontFamily: {
        cursive: ['Dancing Script', 'cursive'],
        sans: ['var(--font-poppins)', 'Poppins', 'system-ui', 'sans-serif'],
      },
      borderColor: {
        gold: '#FFD700',
        'gold-light': '#fffbe6',
        'gold-dark': '#bfa100',
      },
      textColor: {
        gold: '#FFD700',
        'gold-dark': '#bfa100',
        'gold-light': '#fffbe6',
      },
      padding: {
        /**
         * Safe area insets for notched devices (iPhone X, etc.)
         * Usage: p-safe, pt-safe, pl-safe, etc.
         */
        safe: 'max(env(safe-area-inset-top, 0px), 1rem)',
      },
      margin: {
        safe: 'max(env(safe-area-inset-top, 0px), 1rem)',
      },
      inset: {
        safe: 'max(env(safe-area-inset-top, 0px), 1rem)',
      },
    },
  },
  plugins: [],
};

export default config;
