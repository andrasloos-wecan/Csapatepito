/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // ──────────────────────────────────────────────────────────
        // wecan.technology-inspired sötét paletta — deep navy + electric blue
        // A szemantikus névhasználat (paper = bg, card = surface, ink = text)
        // megmarad — csak az értékek lettek sötét-módra cserélve, így a
        // komponensek többségéhez nem kellett hozzányúlni.
        // ──────────────────────────────────────────────────────────
        ink: "#ffffff",         // primer szöveg (fehér)
        paper: "#0b0f24",       // primer háttér (deep navy)
        card: "#131836",        // felület (kártya, sidebar)
        elevated: "#1c2148",    // emelt felület (hover, kpi, modal)
        subtle: "#a8b0c8",      // halvány szöveg
        line: "#2a3160",        // diszkrét keret (látható mind a bg-n, mind a card-on)
        hatch: "#1a1f3d",       // diszkrét bg-szín (alternáló sorok stb.)
        marker: "#f3df8e",      // sárga kiemelő — komment-buborékhoz megmarad

        // Brand: electric blue accent.
        // A szám-skála a sötét témán szándékosan részben "inverz":
        //   brand-50..100  → dark blue tint (kártya-háttérhez aktív állapotnál)
        //   brand-500      → AZ akcent
        //   brand-600      → hover (világosabb)
        //   brand-700+     → light blue szöveg sötét kék felületen
        brand: {
          50:  "#1e2654",
          100: "#2a3580",
          200: "#3d4ca8",
          300: "#4d6cd6",
          400: "#5b8fff",
          500: "#5b8fff",   // PRIMER ACCENT
          600: "#6a9bff",   // hover
          700: "#a3bcff",   // text-on-dark-blue
          800: "#c3d2ff",
          900: "#e3eaff",
        },
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "sans-serif"],
        head: ['"Inter"', "system-ui", "sans-serif"],
        hand: ['"Inter"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 32px -12px rgba(0,0,0,0.5)",
        soft: "0 1px 2px rgba(0,0,0,.2), 0 1px 3px rgba(0,0,0,.15)",
        glow: "0 0 0 4px rgba(91,143,255,0.18)",
      },
    },
  },
  plugins: [],
};
