import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ice: '#a8d8f0',
        'ice-bright': '#c8eaff',
        'ice-dim': '#4a8ab0',
        rink: '#0a1628',
        'rink-mid': '#0d1f3c',
        'rink-light': '#132540',
        'rink-border': '#1a3050',
      },
      fontFamily: {
        display: ['Barlow Condensed', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
        sans: ['Barlow', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
