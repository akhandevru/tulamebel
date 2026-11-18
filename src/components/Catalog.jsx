import { useEffect, useMemo, useRef, useState } from "react";
import { S, has, money, dimsOf, categoryName } from "../lib/site.jsx";

export function Price({ p }) {
  if (!p.price) return null;
  return (
    <div className="price">
      <span className="price__now">{money(p.price)}</span>
      {p.oldPrice && <span className="price__old">{money(p.oldPrice)}</span>}
    </div>
  );
}

function ProductCard({ p, delay, onOpen }) {
  const [first, second] = p.images || [];
  const dims = dimsOf(p);
  return (
    <button className="product" style={{ animationDelay: `${delay}ms` }} onClick={() => onOpen(p.id)}>
      <div className="product__media">
        {p.badge && <span className="product__badge">{p.badge}</span>}
        {first && <img src={first} alt={p.name} loading="lazy" decoding="async" />}
        {second && <img src={second} alt="" loading="lazy" decoding="async" />}
        <span className="product__quick">Подробнее</span>
      </div>
      <div className="product__name">{p.name}</div>
      <div className="product__cat">{categoryName(p.category)}</div>
      <Price p={p} />
      {dims && <div className="product__dims">{dims}</div>}
    </button>
  );
}

export default function Catalog({ filter, setFilter, onOpen }) {
  const pageSize = S.catalog?.pageSize || 8;
  const [shown, setShown] = useState(pageSize);
  const chipsRef = useRef(null);
  const mounted = useRef(false);
  const products = S.products || [];

  const counts = useMemo(
    () => products.reduce((m, p) => ((m[p.category] = (m[p.category] || 0) + 1), m), {}),
    [products]
  );
  const cats = (S.categories || []).filter((c) => counts[c.id]);

  useEffect(() => {
    setShown(pageSize);
    if (!mounted.current) { mounted.current = true; return; }
    chipsRef.current
      ?.querySelector(`[data-filter="${CSS.escape(filter)}"]`)
      ?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [filter, pageSize]);

  if (!has(products)) return null;
  const list = products.filter((p) => filter === "all" || p.category === filter);

  const chip = (id, label, count) => (
    <button
      key={id}
      className={`chip${filter === id ? " is-active" : ""}`}
      data-filter={id}
      aria-pressed={filter === id}
      onClick={() => setFilter(id)}
    >
      {label}<sup>{count}</sup>
    </button>
  );

  return (
    <section className="section" id="catalog">
      <div className="container">
        <div className="section__head reveal">
          <h2 className="section__title">{S.catalog?.title || "Каталог"}</h2>
        </div>
        <div className="filters" ref={chipsRef}>
          {chip("all", "Все", products.length)}
          {cats.map((c) => chip(c.id, c.name, counts[c.id]))}
        </div>
        <div className="products">
          {list.length === 0 && <p className="empty">В этой категории пока нет товаров</p>}
          {list.slice(0, shown).map((p, i) => (
            <ProductCard key={`${filter}-${p.id}`} p={p} delay={(i % pageSize) * 50} onOpen={onOpen} />
          ))}
        </div>
        {list.length > shown && (
          <div className="catalog__more">
            <button className="btn btn--ghost" onClick={() => setShown(shown + pageSize)}>Показать ещё</button>
          </div>
        )}
      </div>
    </section>
  );
}
