import { request } from "undici";
import { config } from "./config.js";
import { getLogger } from "./logger.js";

const log = getLogger();
const TOKEN = config.telegram.token;

const API = `https://api.telegram.org/bot${TOKEN}`;

let offset = 0;

/**
 *  Starts a polling loop to receive messages from Telegram.
 * @param {function} onMessage
 */
export async function pollingLoop(onMessage) {
  log.info("[BOT] Starting polling loop...");

  // Polling loop
  while (true) {
    try {
      // Fetch updates from Telegram API
      const res = await request(
        `${API}/getUpdates?offset=${offset}&timeout=30`
      );
      // Parse the JSON response
      const data = await res.body.json();
      // Process each update
      if (data?.result?.length > 0) {
        for (const update of data.result) {
          // Update the offset to the next update ID
          offset = update.update_id + 1;
          // Extract message text and chat ID
          const msg = update.message?.text;
          const chat = update.message?.chat?.id;

          // If both message and chat ID are present, handle the message
          if (msg && chat) {
            log.info(`[BOT] Received: ${msg}`);
            await onMessage(msg, chat);
          }
        }
      }
    } catch (err) {
      log.error("[BOT] Polling error:", err.message);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}
