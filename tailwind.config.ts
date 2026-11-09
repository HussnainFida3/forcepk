import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#082952",
          50: "#f1f7fa",
          100: "#e6f1f5",
          700: "#062b56",
          800: "#082952",
          900: "#052640",
          950: "#032239",
        },
        brand: {
          DEFAULT: "#008e8c",
          light: "#38d1ca",
          dark: "#007a78",
        },
        accent: {
          blue: "#0968bd",
          teal: "#008e8c",
          navy: "#062b56",
        },
        ink: "#101f37",
        pale: "#f1f7fa",
        line: "#dce6eb",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
      },
      container: {
        center: true,
        padding: "1rem",
        screens: { "2xl": "1200px" },
      },
    },
  },
  plugins: [],
};
export default config;
