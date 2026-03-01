(() => {
  const intro = document.querySelector(".intro");
  if (!intro) return;

  const hit = intro.querySelector(".intro__hit");
  const maskHeart = intro.querySelector(".intro__mask-heart");

  let opened = false;

  // блокируем скролл, пока интро активно
  const prevOverflow = document.documentElement.style.overflow;
  document.documentElement.style.overflow = "hidden";

  const finish = () => {
    intro.classList.add("is-hidden");
    document.documentElement.style.overflow = prevOverflow || "";
    // на всякий — реально вычищаем
    setTimeout(() => intro.remove(), 50);
  };

  const openIntro = () => {
    if (opened) return;
    opened = true;

    // Триггерим переход гарантированно (чтобы браузер не схлопнул в 1 кадр)
    requestAnimationFrame(() => {
      intro.classList.add("is-opening");
    });

    // Ждём именно трансформ маски (самое важное)
    let done = false;
    const onEnd = (e) => {
      if (done) return;
      // интересует конец transform у маски/сердца
      if (e.target === maskHeart && e.propertyName === "transform") {
        done = true;
        cleanup();
        // даём немного времени на fade overlay (он с задержкой)
        setTimeout(finish, 420);
      }
    };

    const cleanup = () => {
      maskHeart?.removeEventListener("transitionend", onEnd);
    };

    maskHeart?.addEventListener("transitionend", onEnd);

    // fallback, если transitionend не прилетит
    setTimeout(() => {
      if (done) return;
      done = true;
      cleanup();
      finish();
    }, 1800);
  };

  hit?.addEventListener("click", openIntro);
  hit?.addEventListener("touchstart", openIntro, { passive: true });
})();