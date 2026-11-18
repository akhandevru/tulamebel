import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// BASE_PATH задаёт подпапку сайта. Для GitHub Pages это "/tulamebel/" (ставится в workflow),
// для своего домена или обычного хостинга переменная не нужна.
export default defineConfig({
  base: process.env.BASE_PATH || "/",
  plugins: [react()],
  server: { port: 5173, open: false },
});
