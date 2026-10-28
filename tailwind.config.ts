import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Vibrant Amber Orange
          600: '#ea580c', // Deep Orange
          700: '#c2410c', // Dark Amber
          800: '#9a3412', // Rich Bronze
          900: '#7c2d12', // Warm Dark Terracotta
          950: '#431407',
        },
        copper: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#bfa094',
          600: '#a18072',
          700: '#846358',
          800: '#674a40',
          900: '#4e342b',
        },
        emeraldTech: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-orange': '0 0 25px -5px rgba(234, 88, 12, 0.4)',
        'glow-amber': '0 0 35px -5px rgba(249, 115, 22, 0.3)',
      }
    },
  },
  plugins: [],
};
export default config;
