import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      colors: {
        "accent-blue": "var(--accent-blue)",
        "accent-green": "var(--accent-green)",
        "accent-red": "var(--accent-red)",
        "accent-amber": "var(--accent-amber)",
        "accent-purple": "var(--accent-purple)",
      },
    },
  },
  plugins: [],
}

export default config
