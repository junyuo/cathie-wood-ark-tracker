/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        muted: "#667085",
        panel: "#ffffff",
        wash: "#f5f7fb",
        brand: "#1f4f46",
        buy: "#047857",
        sell: "#b42318"
      }
    }
  },
  plugins: []
};
