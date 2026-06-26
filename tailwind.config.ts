import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Admin "luxe + gold" system — light/dark via CSS vars (see DESIGN.md / globals.css)
        canvas: "rgb(var(--ad-canvas) / <alpha-value>)",
        panel: "rgb(var(--ad-panel) / <alpha-value>)",
        raised: "rgb(var(--ad-raised) / <alpha-value>)",
        raised2: "rgb(var(--ad-raised2) / <alpha-value>)",
        line: "rgb(var(--ad-line) / <alpha-value>)",
        line2: "rgb(var(--ad-line2) / <alpha-value>)",
        ink: "rgb(var(--ad-ink) / <alpha-value>)",
        muted: "rgb(var(--ad-muted) / <alpha-value>)",
        faint: "rgb(var(--ad-faint) / <alpha-value>)",
        gold: {
          DEFAULT: "rgb(var(--ad-gold) / <alpha-value>)",
          hi: "rgb(var(--ad-gold-hi) / <alpha-value>)",
          dim: "rgb(var(--ad-gold-dim) / <alpha-value>)",
        },
        ongold: "rgb(var(--ad-on-gold) / <alpha-value>)",
        success: "rgb(var(--ad-success) / <alpha-value>)",
        info: "rgb(var(--ad-info) / <alpha-value>)",
        indigoish: "rgb(var(--ad-indigoish) / <alpha-value>)",
        warning: "rgb(var(--ad-warning) / <alpha-value>)",
        danger: "rgb(var(--ad-danger) / <alpha-value>)",
      },
      fontFamily: {
        serif: ["Prata", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
