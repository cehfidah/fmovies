import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#00acc1', hover: '#0097a7', light: '#00cee7' },
        dark: {
          DEFAULT: '#0b0c0e',
          100: '#111318',
          200: '#161b22',
          300: '#1c2128',
          400: '#22272e',
          500: '#2d333b',
        },
        border: { DEFAULT: '#30363d' },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #00acc1, #00cee7)',
        'hero-bg': 'linear-gradient(135deg, #0b1a1c 0%, #0b0c0e 60%, #0b1015 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
