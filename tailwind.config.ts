import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        cinema: {
          DEFAULT: "#F5C518",
          dark: "#D4A30A",
          light: "#FDE047"
        },
        brand: {
          red: "#E50914",
          "red-hover": "#FF1E27",
          "red-muted": "#991B1B",
          dark: "#060608"
        },
        surface: {
          DEFAULT: "#121216",
          card: "#16161C",
          elevated: "#1D1D26",
          border: "rgba(255,255,255,0.08)"
        }
      },
      boxShadow: {
        cinema: "0 20px 60px rgba(245,197,24,0.3)",
        "brand-glow": "0 0 25px rgba(229,9,20,0.35)",
        "card-hover": "0 20px 40px -15px rgba(0,0,0,0.7)"
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(-6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "hero-fade": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out",
        "hero-fade": "hero-fade 0.5s ease-out"
      }
    }
  },
  plugins: []
};
export default config;