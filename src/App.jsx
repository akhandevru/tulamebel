import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { S } from "./lib/site.jsx";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import About from "./components/About.jsx";
import Categories from "./components/Categories.jsx";
import Catalog from "./components/Catalog.jsx";
import Showcase from "./components/Showcase.jsx";
import { Advantages, Projects, Process, Reviews, Faq } from "./components/Sections.jsx";
import Contact from "./components/Contact.jsx";
import Footer, { FloatButton } from "./components/Footer.jsx";
import ProductModal from "./components/ProductModal.jsx";
import Lightbox from "./components/Lightbox.jsx";

const DEFAULT_ORDER = ["hero", "about", "categories", "catalog", "showcase", "advantages", "projects", "process", "reviews", "faq", "contact"];

// Анимация появления блоков при прокрутке
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }),
      { rootMargin: "0px 0px -8% 0px" }
    );
    document.querySelectorAll(".reveal:not(.is-in)").forEach((el) => {
      // Соседние элементы появляются по очереди
      const sibs = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
      el.style.transitionDelay = Math.min(sibs.indexOf(el), 5) * 80 + "ms";
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [productId, setProductId] = useState(null);
  const [lightbox, setLightbox] = useState({ items: [], index: 0 });
  const [prefill, setPrefill] = useState(null);
  const [toastText, setToastText] = useState("");
  const toastTimer = useRef(null);

  const product = (S.products || []).find((p) => p.id === productId) || null;
  const lightboxOpen = lightbox.items.length > 0;

  useReveal();

  const toast = useCallback((text) => {
    setToastText(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastText(""), 4000);
  }, []);

  const openLightbox = (items, index) => setLightbox({ items, index });
  const closeLightbox = () => setLightbox((l) => ({ ...l, items: [] }));

  const pickCategory = (id) => {
    const exists = (S.products || []).some((p) => p.category === id);
    setFilter(exists ? id : "all");
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
  };

  const order = (name) => {
    setProductId(null);
    setPrefill({ product: name, t: Date.now() });
  };

  // Блокировка прокрутки страницы под открытым окном или меню
  useEffect(() => {
    const locked = menuOpen || !!product || lightboxOpen;
    document.body.classList.toggle("locked", locked);
    document.body.classList.toggle("menu-open", menuOpen);
  }, [menuOpen, product, lightboxOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (lightboxOpen) {
        const n = lightbox.items.length;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowRight") setLightbox((l) => ({ ...l, index: (l.index + 1) % n }));
        if (e.key === "ArrowLeft") setLightbox((l) => ({ ...l, index: (l.index - 1 + n) % n }));
      } else if (product && e.key === "Escape") setProductId(null);
      else if (menuOpen && e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightboxOpen, lightbox.items.length, product, menuOpen]);

  const sections = {
    hero: <Hero />,
    about: <About />,
    categories: <Categories onPick={pickCategory} />,
    catalog: <Catalog filter={filter} setFilter={setFilter} onOpen={setProductId} />,
    showcase: <Showcase />,
    advantages: <Advantages />,
    projects: <Projects onZoom={openLightbox} />,
    process: <Process />,
    reviews: <Reviews />,
    faq: <Faq />,
    contact: <Contact prefill={prefill} toast={toast} />,
  };

  return (
    <>
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main id="top">
        {(S.sections || DEFAULT_ORDER).map((k) => sections[k] && <Fragment key={k}>{sections[k]}</Fragment>)}
      </main>
      <Footer />

      <ProductModal product={product} onClose={() => setProductId(null)} onOrder={order} onZoom={openLightbox} />
      <Lightbox
        items={lightbox.items}
        index={lightbox.index}
        setIndex={(i) => setLightbox((l) => ({ ...l, index: i }))}
        onClose={closeLightbox}
      />

      <div className={`toast${toastText ? " is-visible" : ""}`} role="status" aria-live="polite">{toastText}</div>
      <FloatButton />
    </>
  );
}
