(() => {
  const SESSION_INTRO = "wedding-intro-done";
  const SESSION_SCROLL = "wedding-scroll-y";

  function saveScrollPosition() {
    try {
      const y = Math.max(0, window.scrollY || window.pageYOffset || 0);
      sessionStorage.setItem(SESSION_SCROLL, String(y));
    } catch (e) {
      /* ignore private mode / quota */
    }
  }

  function restoreScrollPosition() {
    let y = 0;
    try {
      y = parseInt(sessionStorage.getItem(SESSION_SCROLL) || "0", 10) || 0;
    } catch (e) {
      return;
    }
    if (y <= 0) return;

    const apply = () => {
      window.scrollTo(0, y);
    };

    apply();
    requestAnimationFrame(apply);
    setTimeout(apply, 0);
    setTimeout(apply, 50);
    setTimeout(apply, 150);
    setTimeout(apply, 400);
    window.addEventListener(
      "load",
      () => {
        apply();
        setTimeout(apply, 0);
        setTimeout(apply, 100);
      },
      { once: true }
    );
  }

  let scrollDebounce;
  function wireScrollPersistence() {
    window.addEventListener("pagehide", saveScrollPosition);
    window.addEventListener("beforeunload", saveScrollPosition);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") saveScrollPosition();
    });
    window.addEventListener(
      "scroll",
      () => {
        clearTimeout(scrollDebounce);
        scrollDebounce = setTimeout(saveScrollPosition, 150);
      },
      { passive: true }
    );
  }

  const intro = document.querySelector(".intro");
  const themeMeta = document.getElementById("theme-color-meta");

  /* Уже открывали приглашение в этой вкладке — без интро, с тем же скроллом (обновление, возврат с карт и т.д.) */
  if (sessionStorage.getItem(SESSION_INTRO) === "1") {
    if (themeMeta) themeMeta.setAttribute("content", "#ffffff");
    document.documentElement.classList.remove("intro-active");
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    if (intro) {
      intro.classList.add("is-hidden");
      setTimeout(() => intro.remove(), 0);
    }
    wireScrollPersistence();
    restoreScrollPosition();
    return;
  }

  if (!intro) {
    wireScrollPersistence();
    restoreScrollPosition();
    return;
  }

  const hit = intro.querySelector(".intro__hit");
  if (!hit) {
    wireScrollPersistence();
    restoreScrollPosition();
    return;
  }

  if (themeMeta) themeMeta.setAttribute("content", "#a32323");

  document.documentElement.classList.add("intro-active");
  const prevBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  let opened = false;

  const prevOverflow = document.documentElement.style.overflow;
  document.documentElement.style.overflow = "hidden";

  const DURATION = 3600;

  function finish() {
    try {
      sessionStorage.setItem(SESSION_INTRO, "1");
    } catch (e) {
      /* ignore */
    }
    saveScrollPosition();

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

    intro.classList.add("intro--freeze");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        intro.classList.add("is-opening");
      });
    });

    document.body.style.overflow = prevBodyOverflow || "";
    document.documentElement.style.overflow = prevOverflow || "";

    setTimeout(finish, DURATION + 200);
  }

  hit.addEventListener("click", openIntro);
  hit.addEventListener("touchstart", openIntro, { passive: true });

  hit.setAttribute("tabindex", "0");
  hit.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openIntro();
    }
  });

  wireScrollPersistence();
})();

// === SCROLL ANIMATION FOR DATE SECTION ===
const dateSection = document.querySelector(".date-section");

if (dateSection) {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        dateSection.classList.add("is-visible");
        observer.disconnect();
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

  rows.forEach((el, i) => {
    if (i % 2 === 1) el.classList.add("wave-right");
  });

  [title, ...rows, ...arrows].filter(Boolean).forEach((el) => {
    el.classList.remove("is-inview");
    el.style.transitionDelay = "";
  });

  let played = false;

  const play = () => {
    if (played) return;
    played = true;

    if (title) {
      title.style.transitionDelay = "0ms";
      title.classList.add("is-inview");
    }

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
      rootMargin: "0px 0px -10% 0px",
    }
  );

  io.observe(section);
});

document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".reveal-y, .reveal-wave");
  if (!items.length) return;

  document
    .querySelectorAll(".day-plan__row--right.reveal-wave")
    .forEach((el) => el.classList.add("wave-right"));

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

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
