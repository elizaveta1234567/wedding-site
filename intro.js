(() => {
  const intro = document.querySelector(".intro");
  if (!intro) return;

  const hit = intro.querySelector(".intro__hit");
  let opened = false;

  // блокируем скролл пока интро активно
  const prevOverflow = document.documentElement.style.overflow;
  document.documentElement.style.overflow = "hidden";

  const cleanup = () => {
    document.documentElement.style.overflow = prevOverflow || "";
    intro.remove();
  };

  const openIntro = () => {
    if (opened) return;
    opened = true;

    // 1) сердце раздувается
    intro.classList.add("intro--open");

    // 2) чуть позже гасим текст и сам красный экран
    const FADE_START = 650;
    setTimeout(() => {
      intro.classList.add("intro--fade");
    }, FADE_START);

    // удаляем после фейда
    const REMOVE_AT = 1400;
    setTimeout(cleanup, REMOVE_AT);
  };

  hit?.addEventListener("click", openIntro);
  hit?.addEventListener("touchstart", openIntro, { passive: true });

  // enter/space
  hit?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openIntro();
    }
  });
})();