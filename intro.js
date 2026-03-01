
(() => {
  const intro = document.querySelector(".intro");
  if (!intro) return;

  const hit = intro.querySelector(".intro__hit");

  let opened = false;

  // блокируем скролл пока интро активно
  const prevOverflowHtml = document.documentElement.style.overflow;
  const prevOverflowBody = document.body.style.overflow;
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";

  function finish() {
    intro.classList.add("is-hidden");
    intro.style.pointerEvents = "none";

    // возвращаем скролл
    document.documentElement.style.overflow = prevOverflowHtml || "";
    document.body.style.overflow = prevOverflowBody || "";

    // удаляем
    setTimeout(() => intro.remove(), 50);
  }

  function openIntro() {
    if (opened) return;
    opened = true;

    intro.classList.add("is-opening");

    // ждём завершения анимации opacity
    const onEnd = (e) => {
      if (e.target !== intro) return;
      intro.removeEventListener("transitionend", onEnd);
      finish();
    };

    intro.addEventListener("transitionend", onEnd);

    // страховка (если transitionend не сработал)
    setTimeout(finish, 1100);
  }

  // клик/тап
  hit.addEventListener("click", openIntro);
})();