import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import tsconfigPaths from "vite-tsconfig-paths";

function customExternal(id: any) {
  if (id.startsWith("/static")) return true;
  if (process.env.VITE_CHECK) {
    return id.indexOf("node_modules") !== -1;
  }
  return false;
}

const storageRoot = process.env.STORAGE_ROOT || "../server/staticfiles/client";
const plugins = [react(), tsconfigPaths()];

let minify = undefined;
let rollupOutput = undefined;

export default defineConfig({
  build: {
    outDir: resolve(storageRoot),
    manifest: true,
    minify: minify,
    rollupOptions: {
      input: resolve(__dirname, "index.html"),
      output: rollupOutput,
      external: customExternal,
    },
  },
  base: process.env.NODE_ENV === "production" ? "/static/client/" : "/",
  root: ".",
  plugins: plugins,
});