/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1A237E",
        secondary: "#0288D1",
        accent: "#00BCD4",
        background: "#F5F7FA",
        surface: "#FFFFFF",
        error: "#D32F2F",
      }
    },
  },
  plugins: [],
}
