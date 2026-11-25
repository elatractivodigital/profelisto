/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Fredoka', 'Nunito', 'system-ui', 'sans-serif'],
      },
      colors: {
        duo: {
          green: '#58CC02',
          greenDark: '#46A302',
          greenSoft: '#D7FFB8',
          blue: '#1CB0F6',
          blueDark: '#1899D6',
          blueSoft: '#DDF4FF',
          yellow: '#FFC800',
          yellowDark: '#E5A400',
          yellowSoft: '#FFF5D1',
          orange: '#FF9600',
          orangeDark: '#E07B00',
          red: '#FF4B4B',
          redDark: '#EA2B2B',
          redSoft: '#FFDFE0',
          purple: '#CE82FF',
          purpleDark: '#A560E8',
          ink: '#3C3C3C',
          muted: '#777777',
          line: '#E5E5E5',
          bg: '#F7F9FB',
        },
      },
    },
  },
  plugins: [],
};
