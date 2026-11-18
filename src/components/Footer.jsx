import { useEffect, useState } from "react";
import { S, C, links, messengerLink } from "../lib/site.jsx";
import { Logo } from "./Header.jsx";

export default function Footer() {
  const f = S.footer || {};
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div>
            <a href="#top" className="logo"><Logo /></a>
            <p className="footer__text">{f.text}</p>
          </div>
          <div className="footer__col">
            <div className="footer__head">Разделы</div>
            {(S.nav || []).map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}
          </div>
          <div className="footer__col">
            <div className="footer__head">Контакты</div>
            {C.phone && <a href={links.phone}>{C.phone}</a>}
            {C.email && <a href={links.email}>{C.email}</a>}
            {C.address && <span>{C.address}</span>}
            {C.hours && <span>{C.hours}</span>}
          </div>
        </div>
        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} {S.brand?.name}{f.legal ? ` · ${f.legal}` : ""}</span>
          <span>
            {(f.links || []).map((l, i) => (
              <span key={l.href + i}>{i > 0 && " · "}<a href={l.href}>{l.label}</a></span>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
}

export function FloatButton() {
  const [visible, setVisible] = useState(false);
  const href = messengerLink("Здравствуйте! Хочу проконсультироваться по мебели.");

  useEffect(() => {
    const on = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", on, { passive: true });
    on();
    return () => window.removeEventListener("scroll", on);
  }, []);

  if (!href) return null;
  return (
    <a className={`float-btn${visible ? " is-visible" : ""}`} href={href} target="_blank" rel="noopener" aria-label="Написать нам">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.4A8.4 8.4 0 1 1 21 11.5z" />
      </svg>
    </a>
  );
}
