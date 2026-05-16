/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"General Sans"', 'sans-serif'],
        'general-sans': ['"General Sans"', 'sans-serif'],
      },
      colors: {
        tactical: {
          bg: '#0B1220',
          bgSecondary: '#111827',
          card: '#172033',
          border: '#243041',
          primary: '#16C47F',
          red: '#EF4444',
          amber: '#F59E0B',
          blue: '#3B82F6',
          textPrimary: '#F9FAFB',
          textSecondary: '#94A3B8',
        }
      },
      boxShadow: {
        'tactical': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'tactical-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
      }
    },
  },
  plugins: [],
}
