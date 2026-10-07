import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0C2340",
          50: "#eef2f7",
          700: "#102a4c",
          800: "#0C2340",
          900: "#081a30",
        },
        brand: {
          DEFAULT: "#16A34A",
          light: "#22c55e",
          dark: "#12833c",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
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
