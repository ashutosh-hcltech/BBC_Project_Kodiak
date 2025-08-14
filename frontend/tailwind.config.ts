// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}', // Covers files in app/ directory
    './pages/**/*.{js,ts,jsx,tsx,mdx}', // If you have pages/ directory
    './components/**/*.{js,ts,jsx,tsx,mdx}', // Essential for your components/ directory
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}