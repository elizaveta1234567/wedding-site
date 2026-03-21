#!/usr/bin/env python3
"""Проверка разметки интро: сердце выше блока текста, единые CSS-переменные."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    css = (ROOT / "styles.css").read_text(encoding="utf-8")

    errors: list[str] = []

    if '<div class="intro__text">' not in html:
        errors.append("Нет обёртки .intro__text")
    if "intro__heart-wrap" not in html:
        errors.append("Нет обёртки .intro__heart-wrap вокруг зоны тапа")
    if html.find("intro__hit") > html.find("intro__text"):
        errors.append("intro__hit должен идти в DOM раньше .intro__text (сердце выше текста)")
    if "intro__title" in html:
        tpos = html.find("intro__title")
        hpos = html.find("intro__hit")
        if hpos > tpos:
            errors.append("Заголовок не должен быть выше .intro__hit в разметке")

    for needle in (
        "--intro-title-size",
        "--intro-hint-size",
        "--intro-heart-to-text",
        ".intro__text",
    ):
        if needle not in css:
            errors.append(f"В styles.css отсутствует: {needle!r}")

    if errors:
        print("FAIL:")
        for e in errors:
            print(" ", e)
        raise SystemExit(1)
    print("OK: intro layout + CSS variables")


if __name__ == "__main__":
    main()
