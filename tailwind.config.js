/** @type {import('tailwindcss').Config} */
// Tailwind v4: custom tokens are defined via @theme in index.css.
// This file only needs content paths for class scanning.
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
}
