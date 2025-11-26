import dotenv from "dotenv";
import { getLogger } from "./logger.js";

dotenv.config();

const log = getLogger();
const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT = process.env.TELEGRAM_CHAT_ID?.split(",") || [];

async function sendMessage(text, innerChats) {
  try {
    const innerChat = innerChats || CHAT;

    // Do not send if token or chat ID is missing
    if (!TOKEN || !innerChat.length) return;
    log.info(`[LOG]: Telegram - Sending message to chats: ${innerChat}`);
    for (const chat of innerChat) {
      // Prepare and send the request to Telegram API
      const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
      // Use URLSearchParams to encode the body
      const body = new URLSearchParams({
        chat_id: chat?.toString().trim(),
        text,
        parse_mode: "HTML",
      });
      // Send the POST request
      await fetch(url, { method: "POST", body }).catch((err) => {
        log.error(`[ERROR]: sendMessage - ${err.message}`);
      });
    }
  } catch (err) {
    log.error(`[ERROR]: Telegram - sendMessage - ${err.message}`);
  }
}

export default { sendMessage };
