import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  build: {
    outDir: "./dist/",
    manifest: true,
  },
  base: process.env.NODE_ENV === "production" ? "/static/" : "/",
  root: ".",
  plugins: [react()],
});
