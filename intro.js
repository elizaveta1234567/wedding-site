(() => {
  const intro = document.getElementById("intro");
  if (!intro) return;

  const hit = intro.querySelector(".intro__hit");

  let opened = false;

  // блокируем скролл пока интро висит
  const prevOverflow = document.documentElement.style.overflow;
  document.documentElement.style.overflow = "hidden";

  function finish() {
    intro.classList.add("is-hidden");
    document.documentElement.style.overflow = prevOverflow || "";
    setTimeout(() => intro.remove(), 50);
  }

  function openIntro() {
    if (opened) return;
    opened = true;

    // 1) растим сердце + прячем текст
    intro.classList.add("is-opening");

    // 2) после роста сердца — плавно уводим весь экран
    setTimeout(() => {
      intro.classList.add("is-fading");
    }, 980); // почти конец heartGrow

    // 3) убираем из DOM после fade
    setTimeout(finish, 980 + 460);
  }

  hit.addEventListener("click", openIntro);
  hit.addEventListener("touchstart", openIntro, { passive: true });

  // DEBUG (можешь удалить потом)
  console.log("[intro] loaded OK");
})();