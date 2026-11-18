import { S, has, Html } from "../lib/site.jsx";

export default function About() {
  const a = S.about;
  if (!a?.title) return null;
  return (
    <section className="section" id="about">
      <div className="container about">
        <div className="reveal">
          <Html as="h2" className="about__title" html={a.title} />
          <div className="about__text">
            {(a.text || []).map((p, i) => <Html as="p" key={i} html={p} />)}
          </div>
          {has(a.stats) && (
            <div className="stats">
              {a.stats.map((s) => (
                <div key={s.label}>
                  <div className="stat__value">{s.value}</div>
                  <div className="stat__label">{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        {a.image && (
          <div className="about__media reveal">
            <img src={a.image} alt={a.title.replace(/<[^>]+>/g, " ")} loading="lazy" decoding="async" />
          </div>
        )}
      </div>
    </section>
  );
}
