/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#10201b",
        moss: "#28584a",
        mint: "#dff4eb",
        paper: "#f8faf7"
      }
    },
  },
  plugins: [],
};
