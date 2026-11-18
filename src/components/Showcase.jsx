import { useEffect, useRef } from "react";
import { S, has, Html } from "../lib/site.jsx";

export default function Showcase() {
  const bgs = useRef([]);

  // Лёгкий параллакс фона при прокрутке
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ticking = false;
    const update = () => {
      bgs.current.forEach((el) => {
        if (!el) return;
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        const k = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        el.style.transform = `translate3d(0, ${k * -8}%, 0)`;
      });
      ticking = false;
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!has(S.showcase)) return null;
  return (
    <section className="showcase" id="showcase">
      {S.showcase.map((s, i) => (
        <div className="showcase__item" key={i}>
          <div className="showcase__bg" ref={(el) => (bgs.current[i] = el)}>
            <img src={s.image} alt="" loading="lazy" decoding="async" />
          </div>
          <div className="container showcase__content">
            <div className="showcase__box reveal">
              <Html as="h2" className="showcase__title" html={s.title} />
              <Html as="p" className="showcase__text" html={s.text} />
              {s.button?.label && <a className="btn btn--light" href={s.button.href}>{s.button.label}</a>}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
