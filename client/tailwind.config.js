/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#34322c",
        paper: "#f7f6f2",
        card: "#fffefb",
        line: "#b9b6ad",
        subtle: "#8c897f",
        hatch: "#ecebe5",
        marker: "#f3df8e",
        brand: {
          50:  "#eef3f8",
          100: "#dce8f2",
          200: "#b8d2e6",
          300: "#8db5d3",
          400: "#5d92ba",
          500: "#3b6ea5",
          600: "#2f5984",
          700: "#264665",
          800: "#1d344a",
          900: "#152330",
        },
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "sans-serif"],
        head: ['"Inter"', "system-ui", "sans-serif"],
        hand: ['"Inter"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 0 rgba(0,0,0,.02), 0 8px 24px -10px rgba(0,0,0,.12)",
        soft: "0 1px 2px rgba(0,0,0,.04), 0 1px 3px rgba(0,0,0,.06)",
      },
    },
  },
  plugins: [],
};
