/* Собирает страницу из window.SITE (config.js). Контент здесь не редактируется. */
(() => {
  "use strict";

  const S = window.SITE || {};
  const C = S.contacts || {};
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const has = (v) => (Array.isArray(v) ? v.length > 0 : !!v);
  const digits = (s = "") => String(s).replace(/\D/g, "");
  const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = (n) => new Intl.NumberFormat(S.locale || "ru-RU").format(n) + " " + (S.currency || "₽");
  const lazy = (src, alt = "", eager = false) =>
    `<img src="${esc(src)}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;

  const ICON_CHAT =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.4A8.4 8.4 0 1 1 21 11.5z"/></svg>';

  const links = {
    phone: C.phone ? `tel:+${digits(C.phone)}` : "",
    email: C.email ? `mailto:${C.email}` : "",
    whatsapp: (text = "") => (C.whatsapp ? `https://wa.me/${digits(C.whatsapp)}${text ? `?text=${encodeURIComponent(text)}` : ""}` : ""),
    telegram: C.telegram ? `https://t.me/${String(C.telegram).replace(/^@/, "")}` : "",
  };
  const messengerLink = (text) => links.whatsapp(text) || links.telegram || links.phone;

  /* ---------- Тема и мета ---------- */
  function applyTheme() {
    const t = S.theme || {};
    const root = document.documentElement.style;
    const map = { bg: "--bg", surface: "--surface", ink: "--ink", muted: "--muted", accent: "--accent", dark: "--dark", footer: "--footer", radius: "--radius" };
    Object.entries(map).forEach(([k, v]) => t[k] && root.setProperty(v, t[k]));
    if (t.fontDisplay) root.setProperty("--font-display", `"${t.fontDisplay}", system-ui, sans-serif`);
    if (t.fontBody) root.setProperty("--font-body", `"${t.fontBody}", system-ui, sans-serif`);
    if (t.fontMono) root.setProperty("--font-mono", `"${t.fontMono}", ui-monospace, monospace`);
    if (t.displayUppercase === false) document.documentElement.classList.add("no-caps");

    // У display-шрифта грузим только начертание по умолчанию: у многих (Tenor Sans) нет других весов,
    // и запрос несуществующего веса ломает загрузку всех шрифтов сразу.
    const fonts = [
      t.fontDisplay && t.fontDisplay.replace(/ /g, "+"),
      t.fontBody && `${t.fontBody.replace(/ /g, "+")}:wght@400;500;600`,
      t.fontMono && `${t.fontMono.replace(/ /g, "+")}:wght@400;500`,
    ].filter(Boolean);
    if (fonts.length) {
      const q = fonts.map((f) => `family=${f}`).join("&");
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = `https://fonts.googleapis.com/css2?${q}&display=swap`;
      document.head.appendChild(l);
    }

    const seo = S.seo || {};
    document.title = seo.title || S.brand?.name || document.title;
    const meta = (attr, key, val) => {
      if (!val) return;
      let m = document.head.querySelector(`meta[${attr}="${key}"]`);
      if (!m) { m = document.createElement("meta"); m.setAttribute(attr, key); document.head.appendChild(m); }
      m.content = val;
    };
    meta("name", "description", seo.description);
    meta("property", "og:title", seo.title);
    meta("property", "og:description", seo.description);
    meta("property", "og:image", seo.image);
    meta("name", "theme-color", t.dark);

    const fav = document.createElement("link");
    fav.rel = "icon";
    if (S.brand?.favicon) fav.href = S.brand.favicon;
    else {
      const letter = esc((S.brand?.name || "M")[0]);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${t.dark || "#1c1a17"}"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Georgia,serif" font-size="40" fill="${t.bg || "#f5f2ed"}">${letter}</text></svg>`;
      fav.href = "data:image/svg+xml," + encodeURIComponent(svg);
    }
    document.head.appendChild(fav);
  }

  const logoHTML = () => {
    const b = S.brand || {};
    return b.logo
      ? `<img src="${esc(b.logo)}" alt="${esc(b.name)}">`
      : `<span class="logo__name">${esc(b.name || "")}</span>${b.tagline ? `<span class="logo__tag">${esc(b.tagline)}</span>` : ""}`;
  };

  /* ---------- Шапка и меню ---------- */
  function renderHeader() {
    $("#logo").innerHTML = logoHTML();
    $("#logo").setAttribute("aria-label", S.brand?.name || "На главную");
    const navHTML = (S.nav || []).map((n) => `<a href="${esc(n.href)}">${esc(n.label)}</a>`).join("");
    $("#nav").innerHTML = navHTML;
    $("#mobileNav").innerHTML = navHTML;
    const phone = $("#headerPhone");
    if (C.phone) { phone.textContent = C.phone; phone.href = links.phone; } else phone.remove();
    $("#mobileContacts").innerHTML = [
      C.phone && `<a href="${links.phone}">${esc(C.phone)}</a>`,
      C.email && `<a href="${links.email}">${esc(C.email)}</a>`,
      C.address && `<span>${esc(C.address)}</span>`,
    ].filter(Boolean).join("");
  }

  /* ---------- Секции ---------- */
  const R = {};

  R.hero = () => {
    const h = S.hero || {};
    if (!has(h.slides)) return "";
    const first = h.slides[0];
    const btn = (b, cls) => (b?.label ? `<a class="btn ${cls}" href="${esc(b.href)}">${esc(b.label)}</a>` : "");
    return `
    <section class="hero" id="hero" aria-label="Главный экран">
      ${h.slides.map((s, i) => `<div class="hero__slide${i === 0 ? " is-active" : ""}">${lazy(s.image, "", i === 0)}</div>`).join("")}
      <div class="hero__content"><div class="container">
        <div class="hero__text">
          <h1 class="hero__title">${first.title || ""}</h1>
          <p class="hero__subtitle">${first.subtitle || ""}</p>
        </div>
        <div class="hero__buttons">${btn(h.button, "btn--light")}${btn(h.buttonSecondary, "btn--ghost")}</div>
      </div></div>
      <div class="hero__controls"><div class="container">
        <div class="hero__dots">${h.slides.length > 1 ? h.slides.map((_, i) => `<button class="hero__dot${i === 0 ? " is-active" : ""}${h.autoplay ? "" : " is-static"}" aria-label="Слайд ${i + 1}"></button>`).join("") : ""}</div>
        <span class="hero__scroll">Листайте вниз</span>
      </div></div>
    </section>`;
  };

  R.about = () => {
    const a = S.about;
    if (!a?.title) return "";
    return `
    <section class="section" id="about"><div class="container about">
      <div class="reveal">
        <h2 class="about__title">${a.title}</h2>
        <div class="about__text">${(a.text || []).map((p) => `<p>${p}</p>`).join("")}</div>
        ${has(a.stats) ? `<div class="stats">${a.stats.map((s) => `<div><div class="stat__value">${esc(s.value)}</div><div class="stat__label">${esc(s.label)}</div></div>`).join("")}</div>` : ""}
      </div>
      ${a.image ? `<div class="about__media reveal">${lazy(a.image, a.title)}</div>` : ""}
    </div></section>`;
  };

  R.categories = () => {
    if (!has(S.categories)) return "";
    return `
    <section class="section section--surface" id="categories"><div class="container">
      <div class="section__head reveal"><h2 class="section__title">Мебель для каждой комнаты</h2></div>
      <div class="cats">
        ${S.categories.map((c) => `<button class="cat reveal" data-cat="${esc(c.id)}">${lazy(c.image, c.name)}<span class="cat__name">${esc(c.name)}</span></button>`).join("")}
      </div>
    </div></section>`;
  };

  R.catalog = () => {
    if (!has(S.products)) return "";
    const counts = S.products.reduce((m, p) => ((m[p.category] = (m[p.category] || 0) + 1), m), {});
    const cats = (S.categories || []).filter((c) => counts[c.id]);
    return `
    <section class="section" id="catalog"><div class="container">
      <div class="section__head reveal"><h2 class="section__title">${esc(S.catalog?.title || "Каталог")}</h2></div>
      <div class="filters" role="tablist">
        <button class="chip is-active" data-filter="all">Все<sup>${S.products.length}</sup></button>
        ${cats.map((c) => `<button class="chip" data-filter="${esc(c.id)}">${esc(c.name)}<sup>${counts[c.id]}</sup></button>`).join("")}
      </div>
      <div class="products" id="products"></div>
      <div class="catalog__more"><button class="btn btn--ghost" id="moreBtn" hidden>Показать ещё</button></div>
    </div></section>`;
  };

  R.showcase = () => {
    if (!has(S.showcase)) return "";
    return `
    <section class="showcase" id="showcase">
      ${S.showcase.map((s) => `
      <div class="showcase__item">
        <div class="showcase__bg" data-parallax>${lazy(s.image, s.title)}</div>
        <div class="container showcase__content"><div class="showcase__box reveal">
          <h2 class="showcase__title">${s.title}</h2>
          <p class="showcase__text">${s.text}</p>
          ${s.button?.label ? `<a class="btn btn--light" href="${esc(s.button.href)}">${esc(s.button.label)}</a>` : ""}
        </div></div>
      </div>`).join("")}
    </section>`;
  };

  R.advantages = () => {
    const a = S.advantages;
    if (!has(a?.items)) return "";
    return `
    <section class="section section--dark" id="advantages"><div class="container">
      <div class="section__head reveal"><h2 class="section__title">${esc(a.title)}</h2></div>
      <div class="adv">${a.items.map((i) => `<div class="adv__item reveal"><h3 class="adv__title">${esc(i.title)}</h3><p class="adv__text">${esc(i.text)}</p></div>`).join("")}</div>
    </div></section>`;
  };

  R.projects = () => {
    const p = S.projects;
    if (!has(p?.items)) return "";
    return `
    <section class="section" id="projects"><div class="container">
      <div class="section__head reveal"><h2 class="section__title">${esc(p.title)}</h2></div>
      <div class="gallery">
        ${p.items.map((it, i) => `
        <button class="gallery__item reveal" data-lightbox="projects" data-index="${i}">
          ${lazy(it.image, it.title)}
          <span class="gallery__cap"><span class="gallery__title">${esc(it.title)}</span><br><span class="gallery__place">${esc(it.place || "")}</span></span>
        </button>`).join("")}
      </div>
    </div></section>`;
  };

  R.process = () => {
    const p = S.process;
    if (!has(p?.steps)) return "";
    return `
    <section class="section section--surface" id="process"><div class="container">
      <div class="section__head reveal"><h2 class="section__title">${esc(p.title)}</h2></div>
      <div class="steps">${p.steps.map((s) => `<div class="step reveal"><h3 class="step__title">${esc(s.title)}</h3><p class="step__text">${esc(s.text)}</p></div>`).join("")}</div>
    </div></section>`;
  };

  R.reviews = () => {
    const r = S.reviews;
    if (!has(r?.items)) return "";
    return `
    <section class="section section--surface" id="reviews" style="padding-top:0"><div class="container reviews">
      <div class="section__head reveal">
        <h2 class="section__title">${esc(r.title)}</h2>
        <div class="arrows"><button class="arrow" data-scroll="-1">Назад</button><button class="arrow" data-scroll="1">Далее</button></div>
      </div>
      <div class="reviews__track" id="reviewsTrack">
        ${r.items.map((i) => `<article class="review"><p class="review__text">${esc(i.text)}</p><div><div class="review__name">${esc(i.name)}</div><div class="review__city">${esc(i.city || "")}</div></div></article>`).join("")}
      </div>
    </div></section>`;
  };

  R.faq = () => {
    const f = S.faq;
    if (!has(f?.items)) return "";
    return `
    <section class="section" id="faq"><div class="container faq">
      <div class="reveal">
        <h2 class="section__title">${esc(f.title)}</h2>
        ${C.phone ? `<p class="section__lead" style="margin-top:20px">Не нашли ответ? Позвоните: <a href="${links.phone}" style="color:var(--ink);font-weight:600">${esc(C.phone)}</a></p>` : ""}
      </div>
      <div class="faq__list reveal">
        ${f.items.map((i) => `
        <div class="faq__item">
          <button class="faq__q" aria-expanded="false">${esc(i.q)}<span class="faq__icon"></span></button>
          <div class="faq__a"><div><p>${i.a}</p></div></div>
        </div>`).join("")}
      </div>
    </div></section>`;
  };

  R.contact = () => {
    const c = S.contact || {};
    const row = (label, value) => (value ? `<div><div class="contact__label">${label}</div><div class="contact__value">${value}</div></div>` : "");
    const socials = [
      links.whatsapp() && ["WhatsApp", links.whatsapp()],
      links.telegram && ["Telegram", links.telegram],
      C.instagram && ["Instagram", C.instagram],
      C.vk && ["ВКонтакте", C.vk],
    ].filter(Boolean);
    const productOptions = has(S.products) ? `<datalist id="productList">${S.products.map((p) => `<option value="${esc(p.name)}">`).join("")}</datalist>` : "";
    return `
    <section class="section section--dark" id="contact"><div class="container">
      <div class="contact">
        <div class="reveal">
          <h2 class="section__title">${esc(c.title || "Контакты")}</h2>
          <p class="contact__text">${esc(c.text || "")}</p>
          <div class="contact__list">
            ${C.phone ? `<a class="contact__phone" href="${links.phone}">${esc(C.phone)}</a>` : ""}
            ${row("Почта", C.email && `<a href="${links.email}">${esc(C.email)}</a>`)}
            ${row("Шоурум", esc(C.address || ""))}
            ${row("Часы работы", esc(C.hours || ""))}
            ${socials.length ? `<div class="socials">${socials.map(([n, h]) => `<a class="social" href="${esc(h)}" target="_blank" rel="noopener">${n}</a>`).join("")}</div>` : ""}
          </div>
        </div>
        <form class="form reveal" id="leadForm" novalidate>
          <div class="form__title">Оставить заявку</div>
          <div class="field"><label for="f-name">Имя</label><input id="f-name" name="name" autocomplete="name" required><span class="field__error">Введите имя</span></div>
          <div class="field"><label for="f-phone">Телефон</label><input id="f-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 (___) ___-__-__" required><span class="field__error">Введите телефон полностью</span></div>
          <div class="field"><label for="f-product">Что интересует</label><input id="f-product" name="product" list="productList" placeholder="Например, кухня или диван Oslo">${productOptions}</div>
          <div class="field"><label for="f-msg">Комментарий</label><textarea id="f-msg" name="message" rows="3"></textarea></div>
          <button class="btn btn--block" type="submit">Отправить</button>
          <p class="form__note">Нажимая кнопку, вы соглашаетесь с обработкой персональных данных.</p>
        </form>
      </div>
      ${c.showMap && C.mapQuery ? `<iframe class="map reveal" title="Карта" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=${encodeURIComponent(C.mapQuery)}&output=embed"></iframe>` : ""}
    </div></section>`;
  };

  function renderFooter() {
    const f = S.footer || {};
    const year = new Date().getFullYear();
    $("#footer").innerHTML = `
    <div class="container">
      <div class="footer__top">
        <div><a href="#top" class="logo">${logoHTML()}</a><p class="footer__text">${esc(f.text || "")}</p></div>
        <div class="footer__col"><div class="footer__head">Разделы</div>${(S.nav || []).map((n) => `<a href="${esc(n.href)}">${esc(n.label)}</a>`).join("")}</div>
        <div class="footer__col"><div class="footer__head">Контакты</div>
          ${C.phone ? `<a href="${links.phone}">${esc(C.phone)}</a>` : ""}
          ${C.email ? `<a href="${links.email}">${esc(C.email)}</a>` : ""}
          ${C.address ? `<span>${esc(C.address)}</span>` : ""}
          ${C.hours ? `<span>${esc(C.hours)}</span>` : ""}
        </div>
      </div>
      <div class="footer__bottom">
        <span>© ${year} ${esc(S.brand?.name || "")}${f.legal ? ` · ${esc(f.legal)}` : ""}</span>
        <span>${(f.links || []).map((l) => `<a href="${esc(l.href)}">${esc(l.label)}</a>`).join(" · ")}</span>
      </div>
    </div>`;
  }

  function renderMain() {
    const order = S.sections || Object.keys(R);
    $("main").innerHTML = order.map((k) => (R[k] ? R[k]() : "")).join("");
  }

  /* ---------- Интерактив ---------- */
  function initHeader() {
    const header = $("#header");
    const hasHero = !!$("#hero");
    let lastY = 0;
    const onScroll = () => {
      const y = window.scrollY;
      const threshold = hasHero ? window.innerHeight * 0.85 : 10;
      header.classList.toggle("is-solid", y > threshold || !hasHero);
      header.classList.toggle("is-hidden", y > lastY && y > threshold + 200 && !document.body.classList.contains("menu-open"));
      lastY = y;
      $("#floatBtn").classList.toggle("is-visible", y > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Подсветка пункта меню текущей секции
    const navLinks = $$("#nav a");
    const targets = navLinks.map((a) => $(a.getAttribute("href"))).filter(Boolean);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    targets.forEach((t) => io.observe(t));

    const burger = $("#burger");
    const menu = $("#mobileMenu");
    const toggle = (open) => {
      burger.classList.toggle("is-open", open);
      menu.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
      document.body.classList.toggle("locked", open);
      burger.setAttribute("aria-expanded", open);
      menu.setAttribute("aria-hidden", !open);
      $$("a", menu).forEach((a, i) => (a.style.transitionDelay = open ? `${0.05 * i + 0.1}s` : "0s"));
    };
    burger.addEventListener("click", () => toggle(!menu.classList.contains("is-open")));
    $$("a", menu).forEach((a) => a.addEventListener("click", () => toggle(false)));
  }

  function initHero() {
    const hero = $("#hero");
    if (!hero) return;
    const slides = S.hero.slides;
    const els = $$(".hero__slide", hero);
    const dots = $$(".hero__dot", hero);
    const text = $(".hero__text", hero);
    const delay = S.hero.autoplay || 0;
    hero.style.setProperty("--autoplay", delay / 1000 + "s");
    let cur = 0, timer;

    const go = (n) => {
      if (n === cur) return;
      els[cur].classList.remove("is-active");
      dots[cur]?.classList.remove("is-active");
      cur = (n + slides.length) % slides.length;
      els[cur].classList.add("is-active");
      const d = dots[cur];
      if (d) { d.classList.remove("is-active"); void d.offsetWidth; d.classList.add("is-active"); }
      text.classList.add("is-changing");
      setTimeout(() => {
        $(".hero__title", text).innerHTML = slides[cur].title || "";
        $(".hero__subtitle", text).innerHTML = slides[cur].subtitle || "";
        text.classList.remove("is-changing");
      }, 450);
      restart();
    };
    const restart = () => {
      clearTimeout(timer);
      if (delay && slides.length > 1) timer = setTimeout(() => go(cur + 1), delay);
    };
    dots.forEach((d, i) => d.addEventListener("click", () => go(i)));

    // Свайп на телефоне
    let x0 = null;
    hero.addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
    hero.addEventListener("touchend", (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1));
      x0 = null;
    });
    document.addEventListener("visibilitychange", () => (document.hidden ? clearTimeout(timer) : restart()));
    restart();
  }

  function initCatalog() {
    const grid = $("#products");
    if (!grid) return;
    const pageSize = S.catalog?.pageSize || 8;
    const catName = Object.fromEntries((S.categories || []).map((c) => [c.id, c.name]));
    const more = $("#moreBtn");
    let filter = "all", shown = pageSize;

    const card = (p, i) => `
      <button class="product" data-product="${esc(p.id)}" style="animation-delay:${(i % pageSize) * 50}ms">
        <div class="product__media">
          ${p.badge ? `<span class="product__badge">${esc(p.badge)}</span>` : ""}
          ${lazy(p.images?.[0], p.name)}${p.images?.[1] ? lazy(p.images[1], "") : ""}
          <span class="product__quick">Подробнее</span>
        </div>
        <div class="product__name">${esc(p.name)}</div>
        <div class="product__cat">${esc(catName[p.category] || "")}</div>
        ${priceHTML(p)}
        ${dimsOf(p) ? `<div class="product__dims">${esc(dimsOf(p))}</div>` : ""}
      </button>`;

    const draw = () => {
      const list = S.products.filter((p) => filter === "all" || p.category === filter);
      grid.innerHTML = list.slice(0, shown).map(card).join("") || `<p class="empty">В этой категории пока нет товаров</p>`;
      more.hidden = list.length <= shown;
    };
    const setFilter = (f) => {
      filter = f; shown = pageSize;
      $$(".chip").forEach((c) => c.classList.toggle("is-active", c.dataset.filter === f));
      $(`.chip[data-filter="${CSS.escape(f)}"]`)?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
      draw();
    };

    $$(".chip").forEach((c) => c.addEventListener("click", () => setFilter(c.dataset.filter)));
    more.addEventListener("click", () => { shown += pageSize; draw(); });
    grid.addEventListener("click", (e) => {
      const b = e.target.closest("[data-product]");
      if (b) openProduct(b.dataset.product);
    });
    $$(".cat").forEach((c) => c.addEventListener("click", () => {
      setFilter($(`.chip[data-filter="${CSS.escape(c.dataset.cat)}"]`) ? c.dataset.cat : "all");
      $("#catalog").scrollIntoView({ behavior: "smooth" });
    }));
    draw();
  }

  // Размер для карточки берётся из характеристик: «Размер», «Габариты», «Спальное место», «Высота»
  const dimsOf = (p) => {
    const key = Object.keys(p.specs || {}).find((k) => /размер|габарит|спальное место|высота/i.test(k));
    return key ? p.specs[key] : "";
  };

  const priceHTML = (p) =>
    p.price ? `<div class="price"><span class="price__now">${money(p.price)}</span>${p.oldPrice ? `<span class="price__old">${money(p.oldPrice)}</span>` : ""}</div>` : "";

  /* ---------- Модалка товара ---------- */
  const modal = $("#productModal");
  let lastFocus = null;

  function openProduct(id) {
    const p = S.products.find((x) => x.id === id);
    if (!p) return;
    const cat = (S.categories || []).find((c) => c.id === p.category);
    const imgs = p.images || [];
    const msg = `Здравствуйте! Интересует «${p.name}»${p.price ? ` (${money(p.price)})` : ""}.`;
    $("#productBody").innerHTML = `
      <div class="pm">
        <div class="pm__gallery">
          <div class="pm__main" data-lightbox="product" data-index="0">${lazy(imgs[0], p.name, true)}</div>
          ${imgs.length > 1 ? `<div class="pm__thumbs">${imgs.map((src, i) => `<button class="pm__thumb${i === 0 ? " is-active" : ""}" data-i="${i}" aria-label="Фото ${i + 1}">${lazy(src, "")}</button>`).join("")}</div>` : ""}
        </div>
        <div class="pm__info">
          ${cat ? `<div class="pm__cat">${esc(cat.name)}</div>` : ""}
          <h2 class="pm__name">${esc(p.name)}</h2>
          ${priceHTML(p)}
          ${p.description ? `<p class="pm__desc">${p.description}</p>` : ""}
          ${p.specs ? `<table class="specs">${Object.entries(p.specs).map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join("")}</table>` : ""}
          <div class="pm__buttons">
            <button class="btn btn--block" data-order="${esc(p.name)}">Оставить заявку</button>
            ${messengerLink(msg) ? `<a class="btn btn--ghost btn--block" href="${esc(messengerLink(msg))}" target="_blank" rel="noopener">Спросить в мессенджере</a>` : ""}
          </div>
        </div>
      </div>`;

    const main = $(".pm__main", modal);
    $$(".pm__thumb", modal).forEach((t) => t.addEventListener("click", () => {
      const i = +t.dataset.i;
      main.innerHTML = lazy(imgs[i], p.name, true);
      main.dataset.index = i;
      $$(".pm__thumb", modal).forEach((x) => x.classList.toggle("is-active", x === t));
    }));
    main.addEventListener("click", () => openLightbox(imgs.map((src) => ({ image: src, title: p.name })), +main.dataset.index));
    $("[data-order]", modal).addEventListener("click", (e) => {
      closeModal();
      const field = $("#f-product");
      if (field) field.value = e.currentTarget.dataset.order;
      $("#contact")?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => $("#f-name")?.focus({ preventScroll: true }), 700);
    });

    lastFocus = document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("locked");
    $(".modal__panel", modal).scrollTop = 0;
    $(".modal__close", modal).focus();
  }
  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    if (!lb.classList.contains("is-open")) document.body.classList.remove("locked");
    lastFocus?.focus?.({ preventScroll: true });
  }
  $$("[data-close]", modal).forEach((b) => b.addEventListener("click", closeModal));

  /* ---------- Просмотр фото ---------- */
  const lb = $("#lightbox");
  let lbItems = [], lbIndex = 0;
  function openLightbox(items, i) {
    lbItems = items; lbIndex = i;
    showLb();
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    document.body.classList.add("locked");
    $$(".lightbox__arrow", lb).forEach((a) => (a.hidden = items.length < 2));
  }
  function showLb() {
    const it = lbItems[lbIndex];
    $("#lightboxImg").src = it.image;
    $("#lightboxImg").alt = it.title || "";
    $("#lightboxCaption").textContent = [it.title, it.place].filter(Boolean).join(" · ");
  }
  function closeLb() {
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    if (!modal.classList.contains("is-open")) document.body.classList.remove("locked");
  }
  const stepLb = (d) => { lbIndex = (lbIndex + d + lbItems.length) % lbItems.length; showLb(); };
  $$(".lightbox__arrow", lb).forEach((a) => a.addEventListener("click", () => stepLb(+a.dataset.dir)));
  $("[data-close]", lb).addEventListener("click", closeLb);
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });

  document.addEventListener("keydown", (e) => {
    if (lb.classList.contains("is-open")) {
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowRight") stepLb(1);
      if (e.key === "ArrowLeft") stepLb(-1);
    } else if (modal.classList.contains("is-open") && e.key === "Escape") closeModal();
    else if (e.key === "Escape" && $("#mobileMenu").classList.contains("is-open")) $("#burger").click();
  });

  function initGallery() {
    $$('[data-lightbox="projects"]').forEach((b) =>
      b.addEventListener("click", () => openLightbox(S.projects.items, +b.dataset.index)));
  }

  function initReviews() {
    const track = $("#reviewsTrack");
    if (!track) return;
    $$("[data-scroll]").forEach((b) => b.addEventListener("click", () => {
      const card = $(".review", track);
      track.scrollBy({ left: +b.dataset.scroll * (card.offsetWidth + 16), behavior: "smooth" });
    }));
  }

  function initFaq() {
    $$(".faq__q").forEach((q) => q.addEventListener("click", () => {
      const item = q.parentElement;
      const open = !item.classList.contains("is-open");
      item.classList.toggle("is-open", open);
      q.setAttribute("aria-expanded", open);
    }));
  }

  /* ---------- Форма ---------- */
  function toast(text) {
    const t = $("#toast");
    t.textContent = text;
    t.classList.add("is-visible");
    clearTimeout(t._t);
    t._t = setTimeout(() => t.classList.remove("is-visible"), 4000);
  }

  function initForm() {
    const form = $("#leadForm");
    if (!form) return;
    const phone = form.phone;

    // Маска телефона +7 (XXX) XXX-XX-XX
    phone.addEventListener("input", () => {
      let d = digits(phone.value);
      if (!d) { phone.value = ""; return; }
      if (d[0] === "8") d = "7" + d.slice(1);
      if (d[0] !== "7") d = "7" + d;
      d = d.slice(0, 11);
      const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
      phone.value = "+7" + (p[0] ? ` (${p[0]}` : "") + (p[0].length === 3 ? ")" : "") + (p[1] ? ` ${p[1]}` : "") + (p[2] ? `-${p[2]}` : "") + (p[3] ? `-${p[3]}` : "");
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nameOk = form.name.value.trim().length > 1;
      const phoneOk = digits(phone.value).length >= 11;
      form.name.parentElement.classList.toggle("has-error", !nameOk);
      phone.parentElement.classList.toggle("has-error", !phoneOk);
      if (!nameOk || !phoneOk) return;

      const data = Object.fromEntries(new FormData(form));
      const text = [
        `Заявка с сайта ${S.brand?.name || ""}`,
        `Имя: ${data.name}`,
        `Телефон: ${data.phone}`,
        data.product && `Интересует: ${data.product}`,
        data.message && `Комментарий: ${data.message}`,
      ].filter(Boolean).join("\n");

      const cfg = S.contact || {};
      const done = () => { form.reset(); toast(cfg.successText || "Спасибо! Мы скоро свяжемся с вами."); };
      const mode = cfg.formMode || "whatsapp";

      if (mode === "formspree" && cfg.formEndpoint) {
        const btn = $("button[type=submit]", form);
        btn.disabled = true;
        try {
          const r = await fetch(cfg.formEndpoint, { method: "POST", headers: { Accept: "application/json" }, body: new FormData(form) });
          r.ok ? done() : toast("Не удалось отправить. Позвоните нам: " + (C.phone || ""));
        } catch { toast("Нет соединения. Позвоните нам: " + (C.phone || "")); }
        btn.disabled = false;
        return;
      }
      const url =
        mode === "email" && C.email ? `mailto:${C.email}?subject=${encodeURIComponent("Заявка с сайта")}&body=${encodeURIComponent(text)}`
        : mode === "telegram" && links.telegram ? links.telegram
        : links.whatsapp(text) || links.telegram || (C.email && `mailto:${C.email}?body=${encodeURIComponent(text)}`);
      if (mode === "telegram") navigator.clipboard?.writeText(text).catch(() => {});
      if (url) window.open(url, "_blank", "noopener");
      done();
    });
  }

  function initFloat() {
    const b = $("#floatBtn");
    const href = messengerLink("Здравствуйте! Хочу проконсультироваться по мебели.");
    if (!href) return b.remove();
    b.href = href;
    b.innerHTML = ICON_CHAT;
  }

  /* ---------- Анимации при прокрутке ---------- */
  function initReveal() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    $$(".reveal").forEach((el) => {
      // Соседние элементы появляются по очереди
      const sibs = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
      el.style.transitionDelay = Math.min(sibs.indexOf(el), 5) * 80 + "ms";
      io.observe(el);
    });

    const par = $$("[data-parallax]");
    if (!par.length || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ticking = false;
    const update = () => {
      par.forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        const k = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        el.style.transform = `translate3d(0, ${k * -8}%, 0)`;
      });
      ticking = false;
    };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* ---------- Запуск ---------- */
  applyTheme();
  renderHeader();
  renderMain();
  renderFooter();
  initHeader();
  initHero();
  initCatalog();
  initGallery();
  initReviews();
  initFaq();
  initForm();
  initFloat();
  initReveal();
})();
