/* ===== INTRO (фикс конфликтов и адаптив) ===== */
.intro{
  position: fixed;
  inset: 0;
  z-index: 999999;
  width: 100vw;
  height: 100vh;
  max-width: none !important;
  background: transparent;
  overflow: hidden;
  opacity: 1;
  pointer-events: auto;
}

.intro__svg{
  position: absolute;
  inset: 0;
  width: 100vw;
  height: 100vh;
  display: block;
}

.intro__hit{
  position: absolute;
  inset: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  z-index: 3;
}

.intro__content{
  position: relative;
  z-index: 4;
  text-align: center;
  display: grid;
  gap: 10px;
  margin-top: clamp(180px, 28vh, 260px);
  transition: opacity 400ms ease 520ms, transform 400ms ease 520ms;
}

.intro__title{
  margin: 0;
  font-family: "Cormorant Garamond", serif;
  font-weight: 600;
  letter-spacing: .08em;
  color: #fff;
  font-size: clamp(22px, 3vw, 40px);
}

.intro__hint{
  margin: 0;
  color: rgba(255,255,255,.85);
  font-family: "Cormorant Garamond", serif;
  letter-spacing: .18em;
  font-size: 12px;
  text-transform: uppercase;
}

/* главное: одинаково анимируем и маску, и обводку */
.intro__heart,
.intro__stroke{
  transform-origin: 50% 50%;
  transform: scale(1);
  will-change: transform;
}

.intro__stroke{
  filter: drop-shadow(0 12px 26px rgba(0,0,0,.25));
}

/* keyframes — чтобы НЕ было “одним кадром” */
@keyframes heartGrow {
  0%   { transform: scale(1); }
  100% { transform: scale(26); }
}

@keyframes introFade {
  0%   { opacity: 1; }
  100% { opacity: 0; }
}

.intro.is-opening .intro__heart,
.intro.is-opening .intro__stroke{
  animation: heartGrow 1000ms cubic-bezier(.2,.9,.2,1) forwards;
}

.intro.is-opening .intro__content{
  opacity: 0;
  transform: translateY(6px);
}

.intro.is-fading{
  animation: introFade 420ms ease forwards;
}

.intro.is-hidden{
  display: none !important;
}
/* ===== /INTRO ===== */
(() => {
  const intro = document.getElementById("intro");
  if (!intro) return;

  const hit = intro.querySelector(".intro__hit");
  let opened = false;

  // блокируем скролл
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

    // 1) растим сердце (1000ms)
    intro.classList.add("is-opening");

    // 2) в конце роста — плавно гасим весь экран (420ms)
    setTimeout(() => {
      intro.classList.add("is-fading");
    }, 980);

    // 3) убираем из DOM
    setTimeout(finish, 980 + 460);
  }

  hit.addEventListener("click", openIntro);
  hit.addEventListener("touchstart", openIntro, { passive: true });

  console.log("[intro] loaded");
})();