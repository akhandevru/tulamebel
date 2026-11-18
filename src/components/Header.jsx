import { useEffect, useState } from "react";
import { S, C, links } from "../lib/site.jsx";

export function Logo() {
  const b = S.brand || {};
  if (b.logo) return <img src={b.logo} alt={b.name} />;
  return (
    <>
      <span className="logo__name">{b.name}</span>
      {b.tagline && <span className="logo__tag">{b.tagline}</span>}
    </>
  );
}

export default function Header({ menuOpen, setMenuOpen }) {
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [active, setActive] = useState("");
  const nav = S.nav || [];

  useEffect(() => {
    const hasHero = !!document.getElementById("hero");
    let lastY = 0;
    const onScroll = () => {
      const y = window.scrollY;
      const threshold = hasHero ? window.innerHeight * 0.85 : 10;
      setSolid(y > threshold || !hasHero);
      setHidden(y > lastY && y > threshold + 200);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Подсветка пункта меню текущей секции
  useEffect(() => {
    const targets = nav.map((n) => n.href.startsWith("#") && document.querySelector(n.href)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive("#" + e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [nav]);

  const close = () => setMenuOpen(false);

  return (
    <>
      <header className={`header${solid ? " is-solid" : ""}${hidden && !menuOpen ? " is-hidden" : ""}`}>
        <div className="container header__inner">
          <a href="#top" className="logo" aria-label={S.brand?.name || "На главную"}><Logo /></a>
          <nav className="nav" aria-label="Основное меню">
            {nav.map((n) => (
              <a key={n.href} href={n.href} className={active === n.href ? "is-active" : undefined}>{n.label}</a>
            ))}
          </nav>
          <div className="header__actions">
            {C.phone && <a className="header__phone" href={links.phone}>{C.phone}</a>}
            <button
              className={`burger${menuOpen ? " is-open" : ""}`}
              aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span /><span />
            </button>
          </div>
        </div>
      </header>

      <div className={`mobile-menu${menuOpen ? " is-open" : ""}`} aria-hidden={!menuOpen}>
        <nav className="mobile-menu__nav">
          {nav.map((n, i) => (
            <a key={n.href} href={n.href} onClick={close} style={{ transitionDelay: menuOpen ? `${0.05 * i + 0.1}s` : "0s" }}>
              {n.label}
            </a>
          ))}
        </nav>
        <div className="mobile-menu__contacts">
          {C.phone && <a href={links.phone}>{C.phone}</a>}
          {C.email && <a href={links.email}>{C.email}</a>}
          {C.address && <span>{C.address}</span>}
        </div>
      </div>
    </>
  );
}
