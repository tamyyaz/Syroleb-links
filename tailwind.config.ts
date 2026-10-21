import type { Config } from "tailwindcss";

// Brand palette sampled from the official Syroleb logo (public/images/logo-full.jpg):
//   S / frame graphite   -> #484745 (brand-700)
//   cedar tree           -> #585d57
//   arch stone           -> #d6cfc9 (sand-300)
//   glass / background   -> #dce1e4 / #f7f7f7 (sage-50)
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Primary — graphite (from the S + frame of the Syroleb logo): buttons,
        // links, footer, header bar
        brand: {
          50: "#f4f4f3",
          100: "#e4e4e2",
          200: "#c9c8c5",
          300: "#a3a29e",
          400: "#7b7a77",
          500: "#5e5d5a",
          600: "#545352",
          700: "#484745",
          800: "#3a3938",
          900: "#262625"
        },
        // Sage — cool light neutral (logo background / glass tint), the main
        // page surface behind the stats/services/category/quality sections
        sage: {
          50: "#f7f7f7",
          100: "#eeedeb",
          200: "#e6e4e1",
          300: "#dcdad7",
          400: "#c4c1bc",
          500: "#9d9a94"
        },
        // Sand — stone beige (the arch in the logo) for the quality-feature
        // cards + CTA banner
        sand: {
          50: "#f8f6f4",
          100: "#ece8e4",
          200: "#e0dad4",
          300: "#d6cfc9",
          400: "#c6bdb7",
          500: "#a89d95"
        },
        ink: {
          900: "#1b1b18",
          800: "#2b2a24"
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        arabic: ["var(--font-arabic)", "Tahoma", "sans-serif"]
      },
      borderRadius: {
        xl2: "1.25rem"
      }
    }
  },
  plugins: []
};

export default config;
