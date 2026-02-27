import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"]
      },
      colors: {
        brand: {
          primary: "var(--brand-primary)",
          primaryHover: "var(--brand-primary-hover)",
          soft: "var(--brand-primary-soft)",
          secondary: "var(--brand-secondary)"
        },
        bg: {
          main: "var(--bg-main)",
          surface: "var(--bg-surface)",
          soft: "var(--bg-soft)",
          soft2: "var(--bg-soft-2)"
        },
        text: {
          primary: "var(--text-primary)",
          muted: "var(--text-muted)"
        },
        border: {
          default: "var(--border-default)"
        }
      }
    }
  },
  plugins: []
};

export default config;
