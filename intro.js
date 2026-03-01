(() => {
  function initIntro() {
    const intro = document.querySelector(".intro");
    if (!intro) return;

    const hit = intro.querySelector(".intro__hit");
    if (!hit) return;

    // блокируем скролл пока интро видно
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    let opened = false;

    const openIntro = () => {
      if (opened) return;
      opened = true;

      // важно: чтобы transition точно сработал
      requestAnimationFrame(() => {
        intro.classList.add("intro--open");
      });

      const finish = () => {
        document.documentElement.style.overflow = prevOverflow || "";
        intro.remove();
      };

      // ждём именно fade интро
      const onEnd = (e) => {
        if (e.target !== intro) return;
        if (e.propertyName !== "opacity") return;
        intro.removeEventListener("transitionend", onEnd);
        finish();
      };

      intro.addEventListener("transitionend", onEnd);

      // страховка
      setTimeout(finish, 1400);
    };

    hit.addEventListener("click", openIntro, { passive: true });
    hit.addEventListener("touchstart", openIntro, { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initIntro);
  } else {
    initIntro();
  }
})();