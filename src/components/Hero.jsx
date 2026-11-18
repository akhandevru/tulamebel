import { useEffect, useRef, useState } from "react";
import { S, has, Html } from "../lib/site.jsx";

export default function Hero() {
  const h = S.hero || {};
  const slides = h.slides || [];
  const delay = h.autoplay || 0;
  const [cur, setCur] = useState(0);
  const touchX = useRef(null);

  const go = (n) => setCur((n + slides.length) % slides.length);

  useEffect(() => {
    if (!delay || slides.length < 2) return;
    let t;
    // Во фоновой вкладке слайды не листаются, ждём возвращения пользователя
    const tick = () => (document.hidden ? (t = setTimeout(tick, delay)) : go(cur + 1));
    t = setTimeout(tick, delay);
    return () => clearTimeout(t);
  }, [cur, delay, slides.length]);

  if (!has(slides)) return null;
  const slide = slides[cur];
  const btn = (b, cls) => b?.label && <a className={`btn ${cls}`} href={b.href}>{b.label}</a>;

  return (
    <section
      className="hero"
      id="hero"
      aria-label="Главный экран"
      style={{ "--autoplay": `${delay / 1000}s` }}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      {slides.map((s, i) => (
        <div key={i} className={`hero__slide${i === cur ? " is-active" : ""}`}>
          <img src={s.image} alt="" {...(i === 0 ? { fetchpriority: "high" } : { loading: "lazy" })} decoding="async" />
        </div>
      ))}

      <div className="hero__content">
        <div className="container">
          {/* key перезапускает анимацию появления текста при смене слайда */}
          <div className="hero__text" key={cur}>
            <Html as="h1" className="hero__title" html={slide.title} />
            <Html as="p" className="hero__subtitle" html={slide.subtitle} />
          </div>
          <div className="hero__buttons">
            {btn(h.button, "btn--light")}
            {btn(h.buttonSecondary, "btn--ghost")}
          </div>
        </div>
      </div>

      <div className="hero__controls">
        <div className="container">
          <div className="hero__dots">
            {slides.length > 1 &&
              slides.map((_, i) => (
                <button
                  key={i === cur ? `a${cur}` : i}
                  className={`hero__dot${i === cur ? " is-active" : ""}${delay ? "" : " is-static"}`}
                  aria-label={`Слайд ${i + 1}`}
                  onClick={() => go(i)}
                />
              ))}
          </div>
          <span className="hero__scroll">Листайте вниз</span>
        </div>
      </div>
    </section>
  );
}
