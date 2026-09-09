/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        ink: { 50: '#f6f5f1', 900: '#1a1a17' },
        scroll: '#b89b5e',
        grape: '#4338ca'
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'Georgia', 'serif']
      }
    }
  },
  plugins: []
}
