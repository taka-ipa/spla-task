import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#2563eb", // ブルー
          soft: "#dbeafe",
        },
      },
      borderRadius: { "2xl": "1rem" },
    },
  },
  plugins: [],
}

export default config
