// Netlify Function: принимает webhook от Netlify Forms и шлёт сообщение в Telegram
exports.handler = async (event) => {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return { statusCode: 500, body: "Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID" };
    }

    const body = event.body ? JSON.parse(event.body) : {};
    // Netlify outgoing webhook: данные обычно лежат тут:
    // body.payload.data
    const data = body?.payload?.data || body?.data || {};

    const name = data.guest_name || "—";
    const attendance = data.attendance || "—";
    const comment = data.comment || "—";

    const text =
      `💌 RSVP заявка\n` +
      `👤 Имя: ${name}\n` +
      `✅ Статус: ${attendance}\n` +
      `📝 Комментарий: ${comment}`;

    const resp = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return { statusCode: 500, body: `Telegram error: ${errText}` };
    }

    return { statusCode: 200, body: "OK" };
  } catch (e) {
    return { statusCode: 500, body: `Error: ${e?.message || e}` };
  }
};