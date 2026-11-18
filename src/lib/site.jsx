/* Общие данные и помощники. Контент здесь не редактируется: он в src/config.js */
import SITE from "../config.js";

export const S = SITE;
export const C = SITE.contacts || {};

export const has = (v) => (Array.isArray(v) ? v.length > 0 : !!v);
export const digits = (s = "") => String(s).replace(/\D/g, "");
export const money = (n) =>
  new Intl.NumberFormat(S.locale || "ru-RU").format(n) + " " + (S.currency || "₽");

export const links = {
  phone: C.phone ? `tel:+${digits(C.phone)}` : "",
  email: C.email ? `mailto:${C.email}` : "",
  whatsapp: (text = "") =>
    C.whatsapp ? `https://wa.me/${digits(C.whatsapp)}${text ? `?text=${encodeURIComponent(text)}` : ""}` : "",
  telegram: C.telegram ? `https://t.me/${String(C.telegram).replace(/^@/, "")}` : "",
};
export const messengerLink = (text) => links.whatsapp(text) || links.telegram || links.phone;

export const categoryName = (id) => (S.categories || []).find((c) => c.id === id)?.name || "";

// Размер для карточки берётся из характеристик: «Размер», «Габариты», «Спальное место», «Высота»
export const dimsOf = (p) => {
  const key = Object.keys(p.specs || {}).find((k) => /размер|габарит|спальное место|высота/i.test(k));
  return key ? p.specs[key] : "";
};

/* Поля config.js, где разрешён HTML (например <br> в заголовке). Конфиг пишет владелец сайта. */
export function Html({ as: Tag = "span", html = "", ...rest }) {
  return <Tag {...rest} dangerouslySetInnerHTML={{ __html: html }} />;
}
