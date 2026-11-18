import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Сборка (npm run build) кладёт готовый сайт в папку docs/ с адресом /tulamebel/.
// GitHub Pages публикует её из ветки: Settings, Pages, Branch: main, папка /docs.
// Для своего домена или хостинга в корне поменяйте base на "/".
export default defineConfig(({ command, isPreview }) => ({
  base: command === "build" || isPreview ? "/tulamebel/" : "/",
  build: { outDir: "docs", emptyOutDir: true },
  plugins: [react()],
  server: { port: 5173, open: false },
}));
