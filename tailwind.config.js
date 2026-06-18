/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas:  "#F8FAFC",
        navy:    "#1A365D",
        sky:     "#00B4D8",
        green:   "#2d8a4e",
        amber:   "#b07218",
        muted:   "#718096",
        border:  "#e2e8f0",
        surface: "#ffffff",
      },
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
