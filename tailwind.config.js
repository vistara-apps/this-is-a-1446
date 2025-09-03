/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(220, 88%, 56%)',
        accent: 'hsl(172, 58%, 43%)',
        bg: 'hsl(210, 36%, 96%)',
        surface: 'hsl(210, 36%, 99%)',
      },
      boxShadow: {
        card: '0 4px 16px hsla(220, 88%, 56%, 0.1)',
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
      },
      spacing: {
        'sm': '4px',
        'md': '8px',
        'lg': '16px',
      },
    },
  },
  plugins: [],
}