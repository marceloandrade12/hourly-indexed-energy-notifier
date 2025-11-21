import dotenv from "dotenv";
import { DateTime } from "luxon";
import cron from "node-cron";
import fetcher from "./fetcher.js";
import { getLogger } from "./logger.js";
import {
  sendCsvDownloadErrorMessage,
  sendErrorMessage,
  sendPriceFoundMessage,
  sendPriceNotFoundMessage,
} from "./message.js";
import parser from "./parser.js";

// Load environment variables from .env file
dotenv.config();

// Initialize logger
const log = getLogger();

// Configuration from environment variables
const CSV_URL = process.env.CSV_URL;
const CACHE_PATH = process.env.CACHE_PATH;
const TZ = process.env.TIMEZONE;

async function runHourlyCheck() {
  // Get current date and hour in specified timezone
  const now = DateTime.now().setZone(TZ);
  // Format date as dd/MM/yyyy
  const today = now.toFormat("dd/MM/yyyy");
  // Get current hour (0-23)
  const hour = now.hour;

  log.info(`[LOG]: runHourlyCheck - for ${today} ${hour}:00`);

  try {
    // Load and parse the cached CSV file
    const json = await parser.loadAndParse(CACHE_PATH);

    log.info(`[LOG]: runHourlyCheck - json parsed successfully`);

    // Extract the price for the current date and hour
    const price = parser.extractPrice(json, today, hour);

    if (price == null) {
      await sendPriceNotFoundMessage(today, hour);
      return;
    }

    log.info(`[LOG]: runHourlyCheck - Price now (${hour}:00): ${price} €/kWh`);
    await sendPriceFoundMessage(hour, price);
  } catch (err) {
    log.error(`[ERROR]: runHourlyCheck - ${err.message}`);
    await sendErrorMessage(err.message);
  }
}

async function startup() {
  // Initial download
  try {
    // Download the CSV file to cache path
    // await fetcher.downloadCsv(CSV_URL, CACHE_PATH);
    // Run the hourly check immediately after download
    await runHourlyCheck();
  } catch (err) {
    log.error(`[ERROR]: startup - ${err.message}`);
  }

  // Schedule daily CSV download at midnight
  cron.schedule(
    "0 0 * * *",
    async () => {
      try {
        log.info(`[LOG]: startup - Daily CSV download started`);
        await fetcher.downloadCsv(CSV_URL, CACHE_PATH);
      } catch (err) {
        log.error(`[ERROR]: startup - Daily CSV download - ${err.message}`);
        await sendCsvDownloadErrorMessage(err.message);
      }
    },
    { timezone: TZ }
  );

  // Schedule hourly price check at the start of every hour
  cron.schedule("0 * * * *", runHourlyCheck, { timezone: TZ });
}

startup();
