(() => {
  const intro = document.querySelector(".intro");
  if (!intro) return;

  const hit = intro.querySelector(".intro__hit");
  let opened = false;

  // блокируем скролл пока интро активно
  const prevOverflow = document.documentElement.style.overflow;
  document.documentElement.style.overflow = "hidden";

  function cleanup() {
    document.documentElement.style.overflow = prevOverflow || "";
    intro.remove();
  }

  function openIntro() {
    if (opened) return;
    opened = true;

    // Стадия 1 — сердце раздувается
    intro.classList.add("intro--open");

    // Стадия 2 — начинаем плавно гасить экран и текст
    // (в этот момент сердце уже “открывает” страницу)
    const FADE_START = 650; // можно 550–750, под вкус
    setTimeout(() => {
      intro.classList.add("intro--fade");
    }, FADE_START);

    // Удаляем после полного фейда
    const REMOVE_AT = 1400; // fade 650 + запас
    setTimeout(cleanup, REMOVE_AT);
  }

  hit?.addEventListener("click", openIntro);
  hit?.addEventListener("touchstart", openIntro, { passive: true });
})();