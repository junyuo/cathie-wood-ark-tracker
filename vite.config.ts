import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/cathie-wood-ark-tracker/",
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "assets/app.js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: (assetInfo) => (assetInfo.name && assetInfo.name.indexOf(".css") !== -1 ? "assets/app.css" : "assets/[name][extname]"),
      },
    },
  },
});
