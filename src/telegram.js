import { config } from "./config.js";
import { getLogger } from "./logger.js";

const log = getLogger();
const TOKEN = config.telegram.token;
const CHAT = config.telegram.chatId;

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
