(() => {
  const intro = document.querySelector(".intro");
  if (!intro) return;

  const hit = intro.querySelector(".intro__hit");
  if (!hit) return;

  let opened = false;

  // блокируем скролл пока интро активно
  const prevOverflow = document.documentElement.style.overflow;
  document.documentElement.style.overflow = "hidden";

  // сколько длится анимация (должно совпадать с CSS var(--introDur))
  const DURATION = 1600;

  function finish() {
    intro.classList.add("is-hidden");
    document.documentElement.style.overflow = prevOverflow || "";
    // на всякий — полностью убираем из DOM
    setTimeout(() => intro.remove(), 50);
  }

  function openIntro() {
    if (opened) return;
    opened = true;

    intro.classList.add("is-opening");

    // гарантированный финал (не зависит от transitionend)
    setTimeout(() => {
      finish();
    }, DURATION + 80);
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