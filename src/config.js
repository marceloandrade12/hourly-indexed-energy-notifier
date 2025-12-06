import dotenv from "dotenv";
import { getLogger } from "./logger.js";

// Load environment variables from .env file
dotenv.config();

const log = getLogger();

// Default devices if not provided in environment
const DEFAULT_DEVICES = [
  { name: "🌡️ Aquecedor", power: 500 }, // W
  { name: "❄️ Ar Condicionado", power: 1200 }, // W
  { name: "💽 Máquina Lavar Roupa", power: 800 }, // W
  { name: "💽 Máquina Secar Roupa", power: 650 }, // W
  { name: "🍽️ Máquina Lavar Loiça", power: 1000 }, // W
];

/**
 * Parse devices from environment variable
 * @returns {Array} Array of device objects
 */
const parseDevices = () => {
  try {
    if (process.env.DEVICES) {
      return JSON.parse(process.env.DEVICES);
    }
  } catch (error) {
    log.error("Failed to parse DEVICES from environment, using defaults");
  }
  return DEFAULT_DEVICES;
};

/**
 * Centralized configuration object for all environment variables
 */
export const config = {
  // Telegram configuration
  telegram: {
    token: process.env.TELEGRAM_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID?.split(",") || [],
  },

  // CSV source configuration
  csv: {
    sourceUrl: process.env.CSV_URL,
    cachePath: process.env.CACHE_PATH,
  },

  // Energy tariff configuration
  tariff: {
    name: process.env.TARIFF,
    option: process.env.OPTION,
  },

  // System configuration
  timezone: process.env.TIMEZONE,

  // Devices configuration
  devices: parseDevices(),

  // Price thresholds
  lowPrice: parseFloat(process.env.LOW_PRICE) || 0.1,
  highPrice: parseFloat(process.env.HIGH_PRICE) || 0.1599,
};
