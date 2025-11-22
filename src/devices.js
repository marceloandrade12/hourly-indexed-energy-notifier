export const DEVICES = [
  { name: "🌡️ Aquecedor", power: 500 }, // W
  { name: "❄️ Ar Condicionado", power: 1200 }, // W
  { name: "💽 Máquina Lavar Roupa", power: 800 }, // W
  { name: "💽 Máquina Secar Roupa", power: 650 }, // W
  { name: "🍽️ Máquina Lavar Loiça", power: 1000 }, // W
];

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
