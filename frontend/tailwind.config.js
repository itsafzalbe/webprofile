/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        mono: ["JetBrains Mono", "monospace"],
        sans: ["-apple-system", "BlinkMacSystemFont", "SF Pro Display", "Inter", "Helvetica Neue", "sans-serif"],
      },
      colors: {
        terminal: {
          bg:       "#0d0d0d",
          surface:  "#111111",
          border:   "#1e1e1e",
          text:     "#c0caf5",
          muted:    "#565f89",
          cursor:   "#ff9e64",
          user:     "#7dcfff",
          path:     "#9ece6a",
          branch:   "#bb9af7",
          accent:   "#ff9e64",
          error:    "#f7768e",
          success:  "#9ece6a",
        },
      },
      animation: {
        blink: "blink 1s step-end infinite",
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: 1 },
          "50%":       { opacity: 0 },
        },
        fadeIn: {
          from: { opacity: 0 },
          to:   { opacity: 1 },
        },
        slideUp: {
          from: { opacity: 0, transform: "translateY(10px)" },
          to:   { opacity: 1, transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
}