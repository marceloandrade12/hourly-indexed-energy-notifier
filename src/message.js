import { calculateCosts } from "./devices.js";
import telegram from "./telegram.js";

const lowPrice = 0.1;
const highPrice = 0.1599;

/**
 * Sends a notification message indicating that the CSV file has been successfully updated.
 * @returns {Promise} A promise that resolves when the message has been sent.
 */
const sendFileUpdatedMessage = (pricesForToday) => {
  let text = "📥 O ficheiro CSV foi atualizado com sucesso. \nPara amanhã:\n";

  for (const [index, price] of Object.entries(pricesForToday)) {
    text += `\n`;
    text += price < lowPrice ? "✅" : price < highPrice ? "🆗" : "⚠️";
    text += `  Preço às ${index}:00 - ${price} € / kWh`;
  }

  return telegram.sendMessage(text);
};

const sendPriceNotFoundMessage = (date, hour) => {
  const text = `⚠️ Preço não encontrado para ${date} ${hour}:00`;
  return telegram.sendMessage(text);
};

const sendPriceFoundMessage = (hour, price) => {
  let text = "";
  if (price < lowPrice) {
    text += "✅ Preço baixo! \n\n";
  } else if (price < highPrice) {
    text += "🆗 Preço normal.\n\n";
  } else {
    text += "⚠️ Preço alto! \n\n";
  }
  text += `⚡ Preço agora ${hour}:00 - <b>${price} € / kWh</b>`;

  // add devices cost message

  text += `\n\n💡 <b>Custo estimado para 1 hora de uso:</b>\n`;

  const costs = calculateCosts(price);
  for (const device of costs) {
    text += `\n${device.name} custará <b>${device.cost.toFixed(2)} €</b>.`;
  }
  return telegram.sendMessage(text);
};

const sendErrorMessage = (message) => {
  const text = `❌ Erro: ${message}`;
  return telegram.sendMessage(text);
};

const sendCsvDownloadErrorMessage = (message) => {
  const text = `❌ Erro ao descarregar o ficheiro CSV: ${message}`;
  return telegram.sendMessage(text);
};

export {
  sendCsvDownloadErrorMessage,
  sendErrorMessage,
  sendFileUpdatedMessage,
  sendPriceFoundMessage,
  sendPriceNotFoundMessage,
};
