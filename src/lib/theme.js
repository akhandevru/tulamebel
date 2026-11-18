/* Применяет цвета, шрифты, заголовок вкладки и мета-теги из config.js */
import { S } from "./site.jsx";

export function applyTheme() {
  const t = S.theme || {};
  const root = document.documentElement.style;
  const map = { bg: "--bg", surface: "--surface", ink: "--ink", muted: "--muted", accent: "--accent", dark: "--dark", footer: "--footer", radius: "--radius" };
  Object.entries(map).forEach(([k, v]) => t[k] && root.setProperty(v, t[k]));
  if (t.fontDisplay) root.setProperty("--font-display", `"${t.fontDisplay}", system-ui, sans-serif`);
  if (t.fontBody) root.setProperty("--font-body", `"${t.fontBody}", system-ui, sans-serif`);
  if (t.fontMono) root.setProperty("--font-mono", `"${t.fontMono}", ui-monospace, monospace`);
  if (t.displayUppercase === false) document.documentElement.classList.add("no-caps");

  // У display-шрифта грузим только начертание по умолчанию: у многих (Tenor Sans) нет других весов,
  // и запрос несуществующего веса ломает загрузку всех шрифтов сразу.
  const fonts = [
    t.fontDisplay && t.fontDisplay.replace(/ /g, "+"),
    t.fontBody && `${t.fontBody.replace(/ /g, "+")}:wght@400;500;600`,
    t.fontMono && `${t.fontMono.replace(/ /g, "+")}:wght@400;500`,
  ].filter(Boolean);
  if (fonts.length) {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = `https://fonts.googleapis.com/css2?${fonts.map((f) => `family=${f}`).join("&")}&display=swap`;
    document.head.appendChild(l);
  }

  const seo = S.seo || {};
  document.title = seo.title || S.brand?.name || document.title;
  const meta = (attr, key, val) => {
    if (!val) return;
    let m = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!m) { m = document.createElement("meta"); m.setAttribute(attr, key); document.head.appendChild(m); }
    m.content = val;
  };
  meta("name", "description", seo.description);
  meta("property", "og:type", "website");
  meta("property", "og:title", seo.title);
  meta("property", "og:description", seo.description);
  meta("property", "og:image", seo.image);
  meta("name", "theme-color", t.dark);

  const fav = document.createElement("link");
  fav.rel = "icon";
  if (S.brand?.favicon) fav.href = S.brand.favicon;
  else {
    const letter = (S.brand?.name || "M")[0].replace(/[<&]/g, "");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${t.dark || "#414042"}"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="36" fill="${t.bg || "#ffffff"}">${letter}</text></svg>`;
    fav.href = "data:image/svg+xml," + encodeURIComponent(svg);
  }
  document.head.appendChild(fav);
}
