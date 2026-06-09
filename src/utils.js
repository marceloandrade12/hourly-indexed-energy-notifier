import { DateTime } from "luxon";
import { config } from "./config.js";
import parser from "./parser.js";

const TZ = config.timezone;
const CACHE_PATH = config.csv.cachePath;

/**
 * Get today's date in dd/MM/yyyy format
 * @returns {string}
 */
const getTodayDateString = () => {
  // Get current date and hour in specified timezone
  const now = DateTime.now().setZone(TZ);
  // Format date as dd/MM/yyyy
  const today = now.toFormat("dd/MM/yyyy");

  return today;
};

/**
 * Get current hour
 * @returns {string}
 */
const getCurrentHour = () => {
  // Get current date and hour in specified timezone
  const now = DateTime.now().setZone(TZ);
  // Get current hour (0-23)
  const hour = now.hour;

  return hour;
};

/**
 * Get tomorrow's date in dd/MM/yyyy format
 * @returns {string}
 */
const getTomorrowDateString = () => {
  // Get tomorrow's date in specified timezone
  const tomorrow = DateTime.now().setZone(TZ).plus({ days: 1 });
  // Format date as dd/MM/yyyy
  const tomorrowFormatted = tomorrow.toFormat("dd/MM/yyyy");

  return tomorrowFormatted;
};

const getTodayPrices = async () => {
  const today = getTodayDateString();
  const json = await parser.loadAndParse(CACHE_PATH);
  return parser.extractTodayPrices(json, today);
};

const getTomorrowPrices = async () => {
  const tomorrow = getTomorrowDateString();
  const json = await parser.loadAndParse(CACHE_PATH);
  return parser.extractTodayPrices(json, tomorrow);
};

export {
  getCurrentHour,
  getTodayDateString,
  getTodayPrices,
  getTomorrowDateString,
  getTomorrowPrices,
};
