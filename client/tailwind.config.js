/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff6ec',
          100: '#ffe7d3',
          200: '#ffcba7',
          300: '#ffb07a',
          400: '#ff9351',
          500: '#ff7a29',
          600: '#e0601a',
          700: '#b54813',
          800: '#8a330d',
          900: '#5a1f07'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 20px 45px rgba(15, 23, 42, 0.08)'
      }
    }
  },
  plugins: []
};
