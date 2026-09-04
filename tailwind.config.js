/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111113",
        velvet: "#1c1720",
        gold: "#d9b978",
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};