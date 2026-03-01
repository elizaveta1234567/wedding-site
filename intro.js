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