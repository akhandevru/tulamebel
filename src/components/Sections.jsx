/* Небольшие секции без собственного состояния: преимущества, проекты, этапы, отзывы, вопросы */
import { useRef, useState } from "react";
import { S, C, has, links, Html } from "../lib/site.jsx";

export function Advantages() {
  const a = S.advantages;
  if (!has(a?.items)) return null;
  return (
    <section className="section section--dark" id="advantages">
      <div className="container">
        <div className="section__head reveal"><h2 className="section__title">{a.title}</h2></div>
        <div className="adv">
          {a.items.map((i) => (
            <div className="adv__item reveal" key={i.title}>
              <h3 className="adv__title">{i.title}</h3>
              <p className="adv__text">{i.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Projects({ onZoom }) {
  const p = S.projects;
  if (!has(p?.items)) return null;
  return (
    <section className="section" id="projects">
      <div className="container">
        <div className="section__head reveal"><h2 className="section__title">{p.title}</h2></div>
        <div className="gallery">
          {p.items.map((it, i) => (
            <button className="gallery__item reveal" key={i} onClick={() => onZoom(p.items, i)}>
              <img src={it.image} alt={it.title} loading="lazy" decoding="async" />
              <span className="gallery__cap">
                <span className="gallery__title">{it.title}</span><br />
                <span className="gallery__place">{it.place}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Process() {
  const p = S.process;
  if (!has(p?.steps)) return null;
  return (
    <section className="section section--surface" id="process">
      <div className="container">
        <div className="section__head reveal"><h2 className="section__title">{p.title}</h2></div>
        <div className="steps">
          {p.steps.map((s) => (
            <div className="step reveal" key={s.title}>
              <h3 className="step__title">{s.title}</h3>
              <p className="step__text">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Reviews() {
  const r = S.reviews;
  const track = useRef(null);
  if (!has(r?.items)) return null;
  const scroll = (d) => {
    const card = track.current?.querySelector(".review");
    if (card) track.current.scrollBy({ left: d * (card.offsetWidth + 16), behavior: "smooth" });
  };
  return (
    <section className="section section--surface" id="reviews" style={{ paddingTop: 0 }}>
      <div className="container reviews">
        <div className="section__head reveal">
          <h2 className="section__title">{r.title}</h2>
          <div className="arrows">
            <button className="arrow" onClick={() => scroll(-1)}>Назад</button>
            <button className="arrow" onClick={() => scroll(1)}>Далее</button>
          </div>
        </div>
        <div className="reviews__track" ref={track}>
          {r.items.map((i) => (
            <article className="review" key={i.name}>
              <p className="review__text">{i.text}</p>
              <div>
                <div className="review__name">{i.name}</div>
                <div className="review__city">{i.city}</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  const f = S.faq;
  const [open, setOpen] = useState(() => new Set());
  if (!has(f?.items)) return null;
  const toggle = (i) => setOpen((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });
  return (
    <section className="section" id="faq">
      <div className="container faq">
        <div className="reveal">
          <h2 className="section__title">{f.title}</h2>
          {C.phone && (
            <p className="section__lead" style={{ marginTop: 20 }}>
              Не нашли ответ? Позвоните: <a href={links.phone} style={{ color: "var(--ink)", fontWeight: 600 }}>{C.phone}</a>
            </p>
          )}
        </div>
        <div className="faq__list reveal">
          {f.items.map((it, i) => (
            <div className={`faq__item${open.has(i) ? " is-open" : ""}`} key={it.q}>
              <button className="faq__q" aria-expanded={open.has(i)} onClick={() => toggle(i)}>
                {it.q}<span className="faq__icon" />
              </button>
              <div className="faq__a"><div><Html as="p" html={it.a} /></div></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
