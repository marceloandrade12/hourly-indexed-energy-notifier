import cron from "node-cron";
import { pollingLoop } from "./bot.js";
import { config } from "./config.js";
import fetcher from "./fetcher.js";
import { getLogger } from "./logger.js";
import {
  sendCsvDownloadErrorMessage,
  sendErrorMessage,
  sendHelpMessage,
  sendPriceFoundMessage,
  sendPriceNotFoundMessage,
  sendTodayPricesMessage,
  sendTomorrowPricesMessage,
} from "./message.js";
import parser from "./parser.js";
import {
  getCurrentHour,
  getTodayDateString,
  getTodayPrices,
  getTomorrowPrices,
} from "./utils.js";

// Initialize logger
const log = getLogger();

pollingLoop(async (msg, chat) => {
  log.info(`[BOT]: Message received in chat ${chat}: ${msg}`);
  if (msg.toLowerCase() === "/preco" || msg.toLowerCase() === "/price") {
    runHourlyCheck([chat]);
  }

  if (msg.toLowerCase() === "/hoje" || msg.toLowerCase() === "/today") {
    const todayPrices = await getTodayPrices();
    return sendTodayPricesMessage(todayPrices, [chat]);
  }

  if (msg.toLowerCase() === "/amanha" || msg.toLowerCase() === "/tomorrow") {
    const tomorrowPrices = await getTomorrowPrices();
    return sendTomorrowPricesMessage(tomorrowPrices, "", [chat]);
  }

  if (msg.toLowerCase() === "/help" || msg.toLowerCase() === "/ajuda") {
    log.info(`[BOT]: Sending help message to chat ${chat}`);
    return sendHelpMessage([chat]);
  }

  if (msg.toLowerCase() === "/atualizar" || msg.toLowerCase() === "/update") {
    return await fetcher.downloadCsv(
      config.csv.sourceUrl,
      config.csv.cachePath
    );
  }
});

async function runHourlyCheck(chatId = undefined) {
  const today = getTodayDateString();
  const hour = getCurrentHour();

  log.info(`[LOG]: runHourlyCheck - for ${today} ${hour}:00`);

  try {
    // Load and parse the cached CSV file
    const json = await parser.loadAndParse(config.csv.cachePath);

    log.info(`[LOG]: runHourlyCheck - json parsed successfully`);

    // Extract the price for the current date and hour
    const price = parser.extractPrice(json, today, hour);

    if (price == null) {
      await sendPriceNotFoundMessage(today, hour);
      return;
    }

    log.info(`[LOG]: runHourlyCheck - Price now (${hour}:00): ${price} €/kWh`);
    await sendPriceFoundMessage(hour, price, chatId);
  } catch (err) {
    log.error(`[ERROR]: runHourlyCheck - ${err.message}`);
    await sendErrorMessage(err.message, chatId);
  }
}

async function startup() {
  // Initial download
  try {
    // Download the CSV file to cache path
    await fetcher.downloadCsv(config.csv.sourceUrl, config.csv.cachePath);
    // Run the hourly check immediately after download
    await runHourlyCheck();
  } catch (err) {
    log.error(`[ERROR]: startup - ${err.message}`);
  }

  // Schedule daily CSV download at 16:00 every day
  cron.schedule(
    "0 16 * * *",
    async () => {
      try {
        log.info(`[LOG]: startup - Daily CSV download started`);
        await fetcher.downloadCsv(config.csv.sourceUrl, config.csv.cachePath);
      } catch (err) {
        log.error(`[ERROR]: startup - Daily CSV download - ${err.message}`);
        await sendCsvDownloadErrorMessage(err.message);
      }
    },
    { timezone: config.timezone }
  );

  // Schedule hourly price check at the start of every hour
  cron.schedule(
    "0 * * * *",
    async () => {
      log.info(`[LOG]: startup - Scheduled hourly price check started`);
      await runHourlyCheck();
    },
    { timezone: config.timezone }
  );
}

startup();
