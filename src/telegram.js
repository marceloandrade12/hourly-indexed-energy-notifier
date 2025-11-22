import dotenv from "dotenv";

dotenv.config();

const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT = process.env.TELEGRAM_CHAT_ID?.split(",") || [];

async function sendMessage(text) {
  // Do not send if token or chat ID is missing
  if (!TOKEN || !CHAT.length) return;

  for (const chat of CHAT) {
    // Prepare and send the request to Telegram API
    const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
    // Use URLSearchParams to encode the body
    const body = new URLSearchParams({
      chat_id: chat?.trim(),
      text,
      parse_mode: "HTML",
    });
    // Send the POST request
    await fetch(url, { method: "POST", body }).catch((err) => {
      console.log(`[ERROR]: sendMessage - ${err.message}`);
    });
  }
}

export default { sendMessage };
