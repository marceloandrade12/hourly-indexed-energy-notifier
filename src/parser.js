import csv2json from "csvjson-csv2json";
import dotenv from "dotenv";
import fs from "fs";
import { getLogger } from "./logger.js";

const log = getLogger();

dotenv.config();

const TARIFF = process.env.TARIFF;
const OPTION = process.env.OPTION;

/**
 * Load and parse CSV file into JSON
 * @param {string} filePath - Path to the CSV file
 * @returns {Array<Object>}
 */
const loadAndParse = (filePath) => {
  log.info(`[LOG]: loadAndParse - Loading and parsing CSV from ${filePath}`);
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    log.error(`[ERROR]: loadAndParse - CSV file not found at ${filePath}`);
    throw new Error("CSV não encontrado");
  }
  try {
    log.info(`[LOG]: loadAndParse - Reading CSV file from ${filePath}`);
    const text = fs.readFileSync(filePath, "utf8");
    log.info(`[LOG]: loadAndParse - CSV Loaded With Size ${text.length} bytes`);
    const json = csv2json(text, { parseNumbers: false });
    log.info(`[LOG]: loadAndParse - CSV Parsed with ${json.length} rows`);
    return json;
  } catch (err) {
    log.error(
      `[ERROR]: loadAndParse - Error reading or parsing CSV: ${err.message}`
    );
    throw err;
  }
};

/**
 * Extract price for given date and hour
 * @param {Array<Object>} rows
 * @param {Date} today
 * @param {number} hour
 * @returns {string|null}
 */
const extractPrice = (rows, today, hour) => {
  log.info(`[LOG]: extractPrice - Extracting price for ${today} ${hour}:00`);
  const hourStr = hour.toString().padStart(2, "0");

  const tariffRows = rows.filter((r) => r.tarifario === TARIFF);

  log.info(
    `[LOG]: extractPrice - Found ${tariffRows.length} rows for provider ${TARIFF}`
  );

  const optionRows = tariffRows.filter((r) => r.opcao === OPTION);

  log.info(
    `[LOG]: extractPrice - Found ${optionRows.length} rows for option ${OPTION}`
  );

  const todayRows = optionRows.filter((r) => r.dia === today);

  log.info(
    `[LOG]: extractPrice - Found ${todayRows.length} rows for date ${today}`
  );

  const currentHourRows = todayRows.filter((r) =>
    r.intervalo.startsWith(`[${hourStr}:`)
  );

  log.info(
    `[LOG]: extractPrice - Found ${currentHourRows.length} rows for hour ${hour}:00`
  );

  const pricesForCurrentHour = currentHourRows.map((r) =>
    parseFloat(r.col.replace(",", "."))
  );

  if (pricesForCurrentHour.length === 0) {
    console.log(
      `[WARN]: extractPrice - No price found for ${today} at ${hour}:00`
    );
    return null;
  }

  const averagePrice =
    pricesForCurrentHour.reduce((a, b) => a + b, 0) /
    pricesForCurrentHour.length;

  const roundedAveragePrice = averagePrice?.toFixed(5);

  log.info(
    `[LOG]: extractPrice - Average price for ${today} at ${hour}:00 is ${roundedAveragePrice} €/kWh`
  );

  return roundedAveragePrice;
};

/**
 * Extract prices for the entire day
 * @param {Array<Object>} rows
 * @param {string} today
 * @returns {Object}
 */
const extractTodayPrices = (rows, today) => {
  log.info(`[LOG]: extractTodayPrices - Extracting prices for ${today}`);
  const tariffRows = rows.filter((r) => r.tarifario === TARIFF);

  log.info(
    `[LOG]: extractTodayPrices - Found ${tariffRows.length} rows for provider ${TARIFF}`
  );

  const optionRows = tariffRows.filter((r) => r.opcao === OPTION);

  log.info(
    `[LOG]: extractTodayPrices - Found ${optionRows.length} rows for option ${OPTION}`
  );

  const todayRows = optionRows.filter((r) => r.dia === today);

  log.info(
    `[LOG]: extractTodayPrices - Found ${todayRows.length} rows for date ${today}`
  );

  const prices = {};

  for (let hour = 0; hour < 24; hour++) {
    const hourStr = hour.toString().padStart(2, "0");
    const currentHourRows = todayRows.filter((r) =>
      r.intervalo.startsWith(`[${hourStr}:`)
    );

    log.info(
      `[LOG]: extractTodayPrices - Found ${currentHourRows.length} rows for hour ${hour}:00`
    );

    const pricesForCurrentHour = currentHourRows.map((r) =>
      parseFloat(r.col.replace(",", "."))
    );

    if (pricesForCurrentHour.length === 0) {
      log.warn(
        `[WARN]: extractTodayPrices - No price found for ${today} at ${hour}:00`
      );
      prices[hour] = null;
      continue;
    }

    const averagePrice =
      pricesForCurrentHour.reduce((a, b) => a + b, 0) /
      pricesForCurrentHour.length;

    const roundedAveragePrice = averagePrice?.toFixed(5);

    if (isNaN(roundedAveragePrice)) {
      log.warn(
        `[WARN]: extractTodayPrices - Computed price is NaN for ${today} at ${hour}:00`
      );
      prices[hour] = null;
      continue;
    }

    log.info(
      `[LOG]: extractTodayPrices - Average price for ${today} at ${hour}:00 is ${roundedAveragePrice} €/kWh`
    );

    prices[hour] = roundedAveragePrice;
  }

  return prices;
};

export default { extractPrice, extractTodayPrices, loadAndParse };
