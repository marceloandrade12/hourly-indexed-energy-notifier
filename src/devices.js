import { config } from "./config.js";

export const DEVICES = config.devices;

/**
 * Calculates the cost of running each device for one hour based on the given price per kWh.
 * @param {number} pricePerKwh
 * @returns {Array} Array of objects with device name and calculated cost.
 */
const calculateCosts = (pricePerKwh) => {
  return DEVICES.map((d) => ({
    name: d.name,
    cost: (d.power / 1000) * pricePerKwh,
  }));
};

export { calculateCosts };
