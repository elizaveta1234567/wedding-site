// Netlify Function — отправка RSVP в Telegram

function esc(text = "") {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

exports.handler = async (event) => {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN; // ← из Netlify
    const chatId = process.env.TELEGRAM_CHAT_ID;     // ← из Netlify

    if (!botToken || !chatId) {
      return { statusCode: 500, body: "Telegram env vars missing" };
    }

    const body = JSON.parse(event.body || "{}");
    const data = body?.payload?.data || {};

    const text =
      `💌 <b>RSVP</b>\n` +
      `👤 <b>Имя:</b> ${esc(data.guest_name || "—")}\n` +
      `✅ <b>Статус:</b> ${esc(data.attendance || "—")}\n` +
      `📝 <b>Комментарий:</b> ${esc(data.comment || "—")}`;

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML"
      })
    });

    return { statusCode: 200, body: "OK" };
  } catch (e) {
    return { statusCode: 500, body: e.toString() };
  }
};