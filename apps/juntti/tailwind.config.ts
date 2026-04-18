import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1rem", screens: { sm: "420px" } },
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "system-ui",
          "Roboto",
          "sans-serif",
        ],
      },
      colors: {
        ink: {
          DEFAULT: "#0b0b0f",
          soft: "#1a1a20",
          muted: "#6b6b77",
          hint: "#a6a6b0",
        },
        brand: {
          DEFAULT: "#2563eb", // juntti blue
          soft: "#dbeafe",
          dark: "#1d4ed8",
        },
        accent: {
          DEFAULT: "#f59e0b",
          soft: "#fef3c7",
        },
      },
    },
  },
  plugins: [],
};

export default config;
