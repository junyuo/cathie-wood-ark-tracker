import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/cathie-wood-ark-tracker/",
  plugins: [react()],
});
