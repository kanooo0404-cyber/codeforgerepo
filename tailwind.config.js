/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#303BFA',
          'blue-dark': '#232CD4',
          ivory: '#F3F6F2',
          navy: '#11183B',
          lavender: '#DDE2FF',
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 24px 60px -15px rgba(17, 24, 59, 0.22)',
        card: '0 4px 20px -4px rgba(17, 24, 59, 0.06)',
        pill: '0 8px 20px -6px rgba(48, 59, 250, 0.35)',
      },
    },
  },
  plugins: [],
};
