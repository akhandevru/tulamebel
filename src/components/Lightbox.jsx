export default function Lightbox({ items, index, setIndex, onClose }) {
  const open = items.length > 0;
  const it = items[index] || {};
  const step = (d) => setIndex((index + d + items.length) % items.length);

  return (
    <div
      className={`lightbox${open ? " is-open" : ""}`}
      aria-hidden={!open}
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <button className="lightbox__close" onClick={onClose} aria-label="Закрыть">&times;</button>
      {items.length > 1 && (
        <button className="lightbox__arrow lightbox__arrow--prev" onClick={() => step(-1)}>Назад</button>
      )}
      <figure className="lightbox__figure">
        {it.image && <img src={it.image} alt={it.title || ""} />}
        <figcaption>{[it.title, it.place].filter(Boolean).join(" · ")}</figcaption>
      </figure>
      {items.length > 1 && (
        <button className="lightbox__arrow lightbox__arrow--next" onClick={() => step(1)}>Далее</button>
      )}
    </div>
  );
}
