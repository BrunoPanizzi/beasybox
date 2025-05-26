/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  plugins: [
    // tailwind prose
    require('@tailwindcss/typography'),
  ]
}
