import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  build: {
    outDir: "./dist/",
    manifest: true,
  },
  base: process.env.NODE_ENV === "production" ? "/static/" : "/",
  root: ".",
  plugins: [react(), tsconfigPaths()],
});
