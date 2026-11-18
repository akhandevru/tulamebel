import { useEffect, useRef, useState } from "react";
import { money, messengerLink, categoryName, Html } from "../lib/site.jsx";
import { Price } from "./Catalog.jsx";

export default function ProductModal({ product, onClose, onOrder, onZoom }) {
  const [index, setIndex] = useState(0);
  const lastProduct = useRef(null);
  const closeRef = useRef(null);
  const panelRef = useRef(null);
  if (product) lastProduct.current = product;
  const p = product || lastProduct.current; // держим содержимое, пока окно плавно закрывается
  const open = !!product;

  useEffect(() => {
    if (!product) return;
    setIndex(0);
    if (panelRef.current) panelRef.current.scrollTop = 0;
    closeRef.current?.focus();
  }, [product]);

  const imgs = p?.images || [];
  const msg = p ? `Здравствуйте! Интересует «${p.name}»${p.price ? ` (${money(p.price)})` : ""}.` : "";
  const chat = p ? messengerLink(msg) : "";

  return (
    <div className={`modal${open ? " is-open" : ""}`} aria-hidden={!open} role="dialog" aria-modal="true" aria-label={p?.name}>
      <div className="modal__backdrop" onClick={onClose} />
      <div className="modal__panel" ref={panelRef}>
        <button className="modal__close" ref={closeRef} onClick={onClose} aria-label="Закрыть">&times;</button>
        {p && (
          <div className="pm">
            <div className="pm__gallery">
              <div className="pm__main" onClick={() => onZoom(imgs.map((src) => ({ image: src, title: p.name })), index)}>
                <img key={index} src={imgs[index]} alt={p.name} />
              </div>
              {imgs.length > 1 && (
                <div className="pm__thumbs">
                  {imgs.map((src, i) => (
                    <button key={src} className={`pm__thumb${i === index ? " is-active" : ""}`} onClick={() => setIndex(i)} aria-label={`Фото ${i + 1}`}>
                      <img src={src} alt="" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="pm__info">
              {categoryName(p.category) && <div className="pm__cat">{categoryName(p.category)}</div>}
              <h2 className="pm__name">{p.name}</h2>
              <Price p={p} />
              {p.description && <Html as="p" className="pm__desc" html={p.description} />}
              {p.specs && (
                <table className="specs">
                  <tbody>
                    {Object.entries(p.specs).map(([k, v]) => (
                      <tr key={k}><td>{k}</td><td>{v}</td></tr>
                    ))}
                  </tbody>
                </table>
              )}
              <div className="pm__buttons">
                <button className="btn btn--block" onClick={() => onOrder(p.name)}>Оставить заявку</button>
                {chat && (
                  <a className="btn btn--ghost btn--block" href={chat} target="_blank" rel="noopener">Спросить в мессенджере</a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
