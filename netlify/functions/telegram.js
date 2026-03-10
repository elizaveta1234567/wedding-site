// netlify/functions/telegram.js

function escapeHtml(s = "") {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function parseURLEncoded(bodyText) {
  const out = {};
  const params = new URLSearchParams(bodyText || "");
  for (const [k, v] of params.entries()) out[k] = v;
  return out;
}

function pick(obj, keys) {
  for (const k of keys) {
    if (obj && obj[k] != null && String(obj[k]).trim() !== "") return obj[k];
  }
  return "";
}

export async function handler(event) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN || "EXAMPLE_TOKEN";
    const chatId = process.env.TELEGRAM_CHAT_ID || "EXAMPLE_CHAT_ID";

    // 1) Пытаемся распарсить body максимально устойчиво
    const contentType = (event.headers["content-type"] || event.headers["Content-Type"] || "").toLowerCase();
    const raw = event.body || "";

    let parsed = {};
    if (contentType.includes("application/json")) {
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = {};
      }
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      parsed = parseURLEncoded(raw);
    } else {
      // иногда Netlify присылает json без content-type — попробуем
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = parseURLEncoded(raw);
      }
    }

    // 2) Netlify Forms notifications обычно кладут поля куда-то сюда (варианты)
    // пробуем достать данные из разных “вложенностей”
    const data =
      parsed?.payload?.data ||
      parsed?.payload?.fields ||
      parsed?.data ||
      parsed?.fields ||
      parsed;

    // 3) Достаём именно те поля, что мы назвали в HTML: name/status/comment
    const name = pick(data, ["name", "guest_name", "guest", "full_name"]);
    const status = pick(data, ["status", "attendance", "will_attend"]);
    const comment = pick(data, ["comment", "message", "notes"]);

    const text =
      `💌 <b>RSVP</b>\n` +
      `👤 <b>Имя:</b> ${escapeHtml(name || "—")}\n` +
      `✅ <b>Статус:</b> ${escapeHtml(status || "—")}\n` +
      `✍️ <b>Комментарий:</b> ${escapeHtml(comment || "—")}`;

    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const tgResp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    if (!tgResp.ok) {
      const errText = await tgResp.text();
      return { statusCode: 500, body: `Telegram error: ${errText}` };
    }

    return { statusCode: 200, body: "OK" };
  } catch (e) {
    return { statusCode: 500, body: `Server error: ${String(e)}` };
  }
}