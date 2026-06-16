/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          navy:  "#1A365D",
          sky:   "#00B4D8",
          white: "#F8FAFC",
          green: "#2d8a4e",
        },
      },
    },
  },
  plugins: [],
};
