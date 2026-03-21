(() => {
  const intro = document.querySelector(".intro");
  if (!intro) return;

  const hit = intro.querySelector(".intro__hit");
  if (!hit) return;

  /**
   * Высота в px для интро.
   * Снизу в Chrome часто просвечивает сайт: visualViewport короче layout,
   * либо нижняя панель не входит в innerHeight — добиваем зазор + запас на тач.
   */
  function computeIntroHeightPx() {
    const vv = window.visualViewport;
    const docEl = document.documentElement;
    const ih = window.innerHeight || docEl.clientHeight || 0;
    let h = Math.max(ih, docEl.clientHeight || 0);

    if (vv) {
      const visualBottom = vv.offsetTop + vv.height;
      const gapBelow = Math.max(0, ih - visualBottom);
      h = Math.max(h, ih, visualBottom + gapBelow);
    }

    const touchUi = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    if (touchUi) {
      h += 96;
    }

    return Math.max(h, 1);
  }

  function applyIntroViewport() {
    if (intro.classList.contains("is-hidden")) return;
    document.documentElement.style.setProperty(
      "--intro-vhpx",
      `${computeIntroHeightPx()}px`
    );
  }

  const onViewportChange = () => applyIntroViewport();

  applyIntroViewport();
  window.addEventListener("resize", onViewportChange, { passive: true });
  window.addEventListener("orientationchange", onViewportChange, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", onViewportChange, { passive: true });
    window.visualViewport.addEventListener("scroll", onViewportChange, { passive: true });
  }
  requestAnimationFrame(() => {
    applyIntroViewport();
    requestAnimationFrame(applyIntroViewport);
  });
  window.addEventListener(
    "load",
    () => {
      applyIntroViewport();
      setTimeout(applyIntroViewport, 50);
      setTimeout(applyIntroViewport, 200);
      setTimeout(applyIntroViewport, 500);
    },
    { once: true }
  );

  const themeMeta = document.getElementById("theme-color-meta");
  if (themeMeta) themeMeta.setAttribute("content", "#a32323");

  document.documentElement.classList.add("intro-active");
  const prevBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  let opened = false;

  // блокируем скролл пока интро активно
  const prevOverflow = document.documentElement.style.overflow;
  document.documentElement.style.overflow = "hidden";

  /* max: --introOverlayDelay + --introOverlayFade ≈ 3s + запас */
  const DURATION = 3600;

  function finish() {
    window.removeEventListener("resize", onViewportChange);
    window.removeEventListener("orientationchange", onViewportChange);
    if (window.visualViewport) {
      window.visualViewport.removeEventListener("resize", onViewportChange);
      window.visualViewport.removeEventListener("scroll", onViewportChange);
    }
    document.documentElement.style.removeProperty("--intro-vhpx");
    document.documentElement.classList.remove("intro-active");
    document.body.style.overflow = prevBodyOverflow || "";
    if (themeMeta) themeMeta.setAttribute("content", "#ffffff");

    intro.classList.add("is-hidden");
    document.documentElement.style.overflow = prevOverflow || "";
    setTimeout(() => intro.remove(), 50);
  }

  function openIntro() {
    if (opened) return;
    opened = true;

    /* Сначала снимаем «дыхание» — иначе анимация открытия срывается одним кадром */
    intro.classList.add("intro--freeze");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        intro.classList.add("is-opening");
      });
    });

    setTimeout(finish, DURATION + 200);
  }

  // клик/тап
  hit.addEventListener("click", openIntro);
  hit.addEventListener("touchstart", openIntro, { passive: true });

  // чтобы на клавиатуре тоже работало
  hit.setAttribute("tabindex", "0");
  hit.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openIntro();
    }
  });
})();
// === SCROLL ANIMATION FOR DATE SECTION ===
const dateSection = document.querySelector('.date-section');

if (dateSection) {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        dateSection.classList.add('is-visible');
        observer.disconnect(); // анимация только один раз
      }
    },
    {
      threshold: 0.3,
    }
  );

  observer.observe(dateSection);
}
document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector("#day-plan");
  if (!section) return;

  const title = section.querySelector(".day-plan__title.reveal-y");
  const rows = Array.from(section.querySelectorAll(".day-plan__row.reveal-wave"));
  const arrows = Array.from(section.querySelectorAll(".day-plan__arrow.reveal-y"));

  // Волна: 2-я карточка справа
  rows.forEach((el, i) => {
    if (i % 2 === 1) el.classList.add("wave-right");
  });

  // На всякий случай сбросим состояние (если кто-то уже добавлял классы)
  [title, ...rows, ...arrows].filter(Boolean).forEach((el) => {
    el.classList.remove("is-inview");
    el.style.transitionDelay = "";
  });

  let played = false;

  const play = () => {
    if (played) return;
    played = true;

    // 1) Заголовок
    if (title) {
      title.style.transitionDelay = "0ms";
      title.classList.add("is-inview");
    }

    // 2) Дальше по очереди: row -> arrow -> row -> arrow -> row
    const baseDelay = 500;
const stepDelay = 420;

    const sequence = [];
    const n = Math.max(rows.length, arrows.length);

    for (let i = 0; i < n; i++) {
      if (rows[i]) sequence.push(rows[i]);
      if (arrows[i]) sequence.push(arrows[i]);
    }

    sequence.forEach((el, idx) => {
      el.style.transitionDelay = `${baseDelay + idx * stepDelay}ms`;
      el.classList.add("is-inview");
    });
  };

  // Если IntersectionObserver не поддерживается — просто включаем анимацию сразу
  if (!("IntersectionObserver" in window)) {
    play();
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          play();
          io.disconnect();
        }
      });
    },
    {
      threshold: 0.2,
      rootMargin: "0px 0px -10% 0px", // чтобы запускалось чуть раньше, как на рефе
    }
  );

  io.observe(section);
});
// REVEAL (Day plan + любые .reveal-y / .reveal-wave для всех блоков после полной загрузки DOM)
document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".reveal-y, .reveal-wave");
  if (!items.length) return;

  // Для правых рядов — направление "справа"
  document
    .querySelectorAll(".day-plan__row--right.reveal-wave")
    .forEach((el) => el.classList.add("wave-right"));

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        // Волна: небольшая задержка по индексу внутри секции
        const el = entry.target;
        const parent = el.closest(".day-plan__list") || document;
        const siblings = [...parent.querySelectorAll(".reveal-y, .reveal-wave")];
        const idx = Math.max(0, siblings.indexOf(el));
        el.style.transitionDelay = `calc(var(--revealDelayStep) * ${idx})`;

        el.classList.add("is-inview");
        io.unobserve(el);
      });
    },
    { threshold: 0.18 }
  );

  items.forEach((el) => io.observe(el));
});