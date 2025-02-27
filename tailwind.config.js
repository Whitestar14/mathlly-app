/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./public/**/*.html", "./src/**/*.{vue,js,ts,css,jsx,tsx}"],
  presets: [require("./scripts/tailwind.preset.js")],
  plugins: [],
}; 
