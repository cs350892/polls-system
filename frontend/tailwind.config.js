/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#A855F7",
        secondary: "#ec4899",
        dark: "#1f2937",
      },
    },
  },
  plugins: [],
}
