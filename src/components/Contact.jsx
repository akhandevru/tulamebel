import { useEffect, useRef, useState } from "react";
import { S, C, has, links, digits } from "../lib/site.jsx";

// Маска телефона +7 (XXX) XXX-XX-XX
function formatPhone(value) {
  let d = digits(value);
  if (!d) return "";
  if (d[0] === "8") d = "7" + d.slice(1);
  if (d[0] !== "7") d = "7" + d;
  d = d.slice(0, 11);
  const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
  return "+7" + (p[0] ? ` (${p[0]}` : "") + (p[0].length === 3 ? ")" : "") + (p[1] ? ` ${p[1]}` : "") + (p[2] ? `-${p[2]}` : "") + (p[3] ? `-${p[3]}` : "");
}

const EMPTY = { name: "", phone: "", product: "", message: "" };

export default function Contact({ prefill, toast }) {
  const c = S.contact || {};
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const nameRef = useRef(null);

  // «Оставить заявку» в карточке товара подставляет товар и ставит курсор в поле имени
  useEffect(() => {
    if (!prefill) return;
    setForm((f) => ({ ...f, product: prefill.product }));
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    const t = setTimeout(() => nameRef.current?.focus({ preventScroll: true }), 700);
    return () => clearTimeout(t);
  }, [prefill]);

  const set = (k) => (e) => {
    const v = k === "phone" ? formatPhone(e.target.value) : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: false }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const er = { name: form.name.trim().length < 2, phone: digits(form.phone).length < 11 };
    setErrors(er);
    if (er.name || er.phone) return;

    const text = [
      `Заявка с сайта ${S.brand?.name || ""}`,
      `Имя: ${form.name}`,
      `Телефон: ${form.phone}`,
      form.product && `Интересует: ${form.product}`,
      form.message && `Комментарий: ${form.message}`,
    ].filter(Boolean).join("\n");

    const done = () => { setForm(EMPTY); toast(c.successText || "Спасибо! Мы скоро свяжемся с вами."); };
    const mode = c.formMode || "whatsapp";

    if (mode === "formspree" && c.formEndpoint) {
      setSending(true);
      try {
        const r = await fetch(c.formEndpoint, {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        r.ok ? done() : toast("Не удалось отправить. Позвоните нам: " + (C.phone || ""));
      } catch {
        toast("Нет соединения. Позвоните нам: " + (C.phone || ""));
      }
      setSending(false);
      return;
    }

    const url =
      mode === "email" && C.email ? `mailto:${C.email}?subject=${encodeURIComponent("Заявка с сайта")}&body=${encodeURIComponent(text)}`
      : mode === "telegram" && links.telegram ? links.telegram
      : links.whatsapp(text) || links.telegram || (C.email && `mailto:${C.email}?body=${encodeURIComponent(text)}`);
    if (mode === "telegram") navigator.clipboard?.writeText(text).catch(() => {});
    if (url) window.open(url, "_blank", "noopener");
    done();
  };

  const socials = [
    links.whatsapp() && ["WhatsApp", links.whatsapp()],
    links.telegram && ["Telegram", links.telegram],
    C.instagram && ["Instagram", C.instagram],
    C.vk && ["ВКонтакте", C.vk],
  ].filter(Boolean);

  const row = (label, value) =>
    value && (
      <div>
        <div className="contact__label">{label}</div>
        <div className="contact__value">{value}</div>
      </div>
    );

  return (
    <section className="section section--dark" id="contact">
      <div className="container">
        <div className="contact">
          <div className="reveal">
            <h2 className="section__title">{c.title || "Контакты"}</h2>
            <p className="contact__text">{c.text}</p>
            <div className="contact__list">
              {C.phone && <a className="contact__phone" href={links.phone}>{C.phone}</a>}
              {row("Почта", C.email && <a href={links.email}>{C.email}</a>)}
              {row("Адрес", C.address)}
              {row("Часы работы", C.hours)}
              {socials.length > 0 && (
                <div className="socials">
                  {socials.map(([n, h]) => <a key={n} className="social" href={h} target="_blank" rel="noopener">{n}</a>)}
                </div>
              )}
            </div>
          </div>

          <form className="form reveal" onSubmit={submit} noValidate>
            <div className="form__title">Оставить заявку</div>
            <div className={`field${errors.name ? " has-error" : ""}`}>
              <label htmlFor="f-name">Имя</label>
              <input id="f-name" ref={nameRef} autoComplete="name" value={form.name} onChange={set("name")} required />
              <span className="field__error">Введите имя</span>
            </div>
            <div className={`field${errors.phone ? " has-error" : ""}`}>
              <label htmlFor="f-phone">Телефон</label>
              <input id="f-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+7 (___) ___-__-__" value={form.phone} onChange={set("phone")} required />
              <span className="field__error">Введите телефон полностью</span>
            </div>
            <div className="field">
              <label htmlFor="f-product">Что интересует</label>
              <input id="f-product" list="productList" placeholder="Например, диван или кухонный уголок" value={form.product} onChange={set("product")} />
              {has(S.products) && (
                <datalist id="productList">{S.products.map((p) => <option key={p.id} value={p.name} />)}</datalist>
              )}
            </div>
            <div className="field">
              <label htmlFor="f-msg">Комментарий</label>
              <textarea id="f-msg" rows={3} value={form.message} onChange={set("message")} />
            </div>
            <button className="btn btn--block" type="submit" disabled={sending}>{sending ? "Отправляем…" : "Отправить"}</button>
            <p className="form__note">Нажимая кнопку, вы соглашаетесь с обработкой персональных данных.</p>
          </form>
        </div>

        {c.showMap && C.mapQuery && (
          <iframe
            className="map reveal"
            title="Карта"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${encodeURIComponent(C.mapQuery)}&output=embed`}
          />
        )}
      </div>
    </section>
  );
}
