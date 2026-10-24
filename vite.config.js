import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" باعث می‌شود پروژه روی Netlify و GitHub Pages هم درست باز شود
export default defineConfig({
  plugins: [react()],
  base: "./",
});
