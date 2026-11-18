import { S, has } from "../lib/site.jsx";

export default function Categories({ onPick }) {
  if (!has(S.categories)) return null;
  return (
    <section className="section section--surface" id="categories">
      <div className="container">
        <div className="section__head reveal">
          <h2 className="section__title">Мебель для каждой комнаты</h2>
        </div>
        <div className="cats">
          {S.categories.map((c) => (
            <button key={c.id} className="cat reveal" onClick={() => onPick(c.id)}>
              <img src={c.image} alt={c.name} loading="lazy" decoding="async" />
              <span className="cat__name">{c.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
