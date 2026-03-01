(() => {
  const intro = document.querySelector(".intro");
  if (!intro) return;

  const hit = intro.querySelector(".intro__hit");
  if (!hit) return;

  let opened = false;

  // блокируем скролл пока интро активно
  const prevOverflowHtml = document.documentElement.style.overflow;
  const prevOverflowBody = document.body.style.overflow;
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";

  function restoreScroll() {
    document.documentElement.style.overflow = prevOverflowHtml || "";
    document.body.style.overflow = prevOverflowBody || "";
  }

  function finish() {
    restoreScroll();
    intro.classList.add("is-hidden");
    intro.style.pointerEvents = "none";
    setTimeout(() => intro.remove(), 50);
  }

  function openIntro() {
    if (opened) return;
    opened = true;

    intro.classList.add("is-opening");

    const onEnd = (e) => {
      if (e.target !== intro) return;
      intro.removeEventListener("transitionend", onEnd);
      finish();
    };

    intro.addEventListener("transitionend", onEnd);

    // страховка
    setTimeout(finish, 1100);
  }

  hit.addEventListener("click", openIntro);
  hit.addEventListener("touchstart", openIntro, { passive: true });

  console.log("[intro] ready");
})();