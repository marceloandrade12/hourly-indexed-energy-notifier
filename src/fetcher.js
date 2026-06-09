import fs from "fs";
import path from "path";
import { fetch } from "undici";
import { getLogger } from "./logger.js";
import { sendFileUpdatedMessage } from "./message.js";
import { getTomorrowPrices } from "./utils.js";

const log = getLogger();

async function downloadCsv(url, outPath) {
  log.info(`[LOG]: Downloading CSV from ${url} to ${outPath}`);

  // Ensure output directory exists
  const dir = path.dirname(outPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // Set a timeout for the fetch operation
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  // Perform the fetch
  let res;
  try {
    res = await fetch(url, {
      method: "GET",
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: controller.signal,
    });
  } catch (err) {
    log.error(`[ERROR]: Downloading CSV - Fetch failed - ${err.message}`);
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  log.info(`[LOG]: Downloading CSV - HTTP ${res.status} ${res.statusText}`);

  // Check for HTTP errors
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const text = await res.text();

  // Write to file
  log.info(`[LOG]: Writing CSV to ${outPath}`);
  await fs.promises.writeFile(outPath, text, "utf8");

  log.info(`[LOG]: CSV downloaded and saved to ${outPath}`);

  const tomorrowPrices = await getTomorrowPrices();

  log.info(
    `[LOG]: Extracted ${Object.keys(tomorrowPrices).length} prices for tomorrow`
  );
  await sendFileUpdatedMessage(tomorrowPrices);
}

export default { downloadCsv };
