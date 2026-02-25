// netlify/functions/telegram-webhook.js
export default async (req) => {
  if (req.method !== "POST") {
    return new Response("OK", { status: 200 });
  }

  // Защита: проверяем секретный заголовок от Telegram webhook
  const secret = req.headers.get("x-telegram-bot-api-secret-token");
  if (!secret || secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return new Response("Forbidden", { status: 403 });
  }

  const update = await req.json();
  const token = process.env.TELEGRAM_BOT_TOKEN;

  const tg = async (method, body) => {
    const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    return r.json();
  };

  // 1) /start → показываем кнопки
  if (update.message?.text === "/start") {
    const chatId = update.message.chat.id;

    await tg("sendMessage", {
      chat_id: chatId,
      text: "Привет! Подтверди, пожалуйста, присутствие:",
      reply_markup: {
        inline_keyboard: [
          [{ text: "✅ Я приду", callback_data: "RSVP_YES" }],
          [{ text: "❌ Не смогу", callback_data: "RSVP_NO" }],
        ],
      },
    });

    return new Response("OK", { status: 200 });
  }

  // 2) Нажатие кнопки → callback_query
  if (update.callback_query) {
    const cq = update.callback_query;
    const chatId = cq.message.chat.id;

    // обязательно “закрыть” кружочек загрузки на кнопке
    await tg("answerCallbackQuery", {
      callback_query_id: cq.id,
      text: "Принято ✅",
      show_alert: false,
    });

    if (cq.data === "RSVP_YES") {
      await tg("sendMessage", {
        chat_id: chatId,
        text: "Ура! Записала тебя: ✅ Я приду",
      });
    } else if (cq.data === "RSVP_NO") {
      await tg("sendMessage", {
        chat_id: chatId,
        text: "Поняла 😔 Записала: ❌ Не смогу",
      });
    }

    return new Response("OK", { status: 200 });
  }

  return new Response("OK", { status: 200 });
};