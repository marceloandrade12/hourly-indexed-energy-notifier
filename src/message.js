import { config } from "./config.js";
import { calculateCosts } from "./devices.js";
import telegram from "./telegram.js";
import { getTodayDateString, getTomorrowDateString } from "./utils.js";

const lowPrice = config.lowPrice;
const highPrice = config.highPrice;
const fixedPrice = config.currentFixedPrice;

/**
 * Returns a formatted string showing the difference between indexed and fixed price
 * @param {number} price - The indexed price
 * @returns {string} Formatted difference string
 */
const priceDiffText = (price) => {
  if (!fixedPrice) return "";
  const diff = fixedPrice - price;
  const diffFormatted = diff.toFixed(4);
  if (diff < 0) {
    return ` (Fixo: <b>${diffFormatted}€</b>)`;
  } else if (diff > 0) {
    return ` (Fixo: <b>+${diffFormatted}€</b>)`;
  } else {
    return ` (Fixo: <b>0.0000€</b> )`;
  }
};

const priceEmoji = (price) => {
  if (price < lowPrice) {
    return "✅";
  } else if (price < highPrice) {
    return "🆗";
  } else {
    return "⚠️";
  }
};

const priceEmojiAndText = (price) => {
  if (price < lowPrice) {
    return priceEmoji(price) + " Preço baixo";
  } else if (price < highPrice) {
    return priceEmoji(price) + " Preço normal";
  } else {
    return priceEmoji(price) + " Preço alto";
  }
};

const getTextFromPrices = (prices) => {
  let text = "";

  for (const [index, price] of Object.entries(prices)) {
    if (price !== null && price !== undefined && !isNaN(price)) {
      text += `\n`;
      text += priceEmoji(price);
      text += ` ${index}h - ${price}€ `;
      text += priceDiffText(price);
    }
  }

  if (fixedPrice) {
    text += `\n\n📌 Preço fixo: <b>${fixedPrice}€</b>`;
  }

  return text;
};

const sendTomorrowPricesMessage = (
  pricesForTomorrow,
  beginText,
  chatId = null,
) => {
  const tomorrow = getTomorrowDateString();
  let text = `${beginText} Para amanhã (${tomorrow}):\n`;
  text += getTextFromPrices(pricesForTomorrow);
  return telegram.sendMessage(text, chatId);
};

const sendTodayPricesMessage = (pricesForToday, chatId = null) => {
  const today = getTodayDateString();
  let text = `Para hoje (${today}):\n`;
  text += getTextFromPrices(pricesForToday);
  return telegram.sendMessage(text, chatId);
};

const sendFileUpdatedMessage = (pricesForTomorrow, chatId = null) => {
  return sendTomorrowPricesMessage(
    pricesForTomorrow,
    "📥 O ficheiro CSV foi atualizado com sucesso. \n",
    chatId,
  );
};

const sendPriceNotFoundMessage = (date, hour, chatId = null) => {
  const text = `⚠️ Preço não encontrado para ${date} ${hour}:00`;
  return telegram.sendMessage(text, chatId);
};

const sendPriceFoundMessage = (hour, price, chatId = null) => {
  let text = "";
  text += priceEmojiAndText(price) + " \n\n";
  text += `⚡ ${hour}:00 - <b>${price}€ / kWh</b>`;
  text += priceDiffText(price);

  if (fixedPrice) {
    text += `\n📌 Preço fixo: <b>${fixedPrice}€</b>`;
  }

  // add devices cost message

  text += `\n\n💡 <b>Custo estimado para 1 hora de uso:</b>\n`;

  const costs = calculateCosts(price, fixedPrice);
  for (const device of costs) {
    text += `\n${device.name} custará <b>${device.cost.toFixed(2)}€</b>.`;
  }
  return telegram.sendMessage(text, chatId);
};

const sendPricesFoundMessage = (hour, prices, chatId = null) => {
  const averagePrice = (
    prices.reduce((a, b) => Number(a) + Number(b), 0) / prices.length
  ).toFixed(5);

  let text = "";

  text += priceEmojiAndText(averagePrice) + " \n";

  prices.map((price, index) => {
    const minutes = (index * 15).toString().padStart(2, "0");
    text += `\n⚡${hour}:${minutes} - <b>${price}€</b>`;
    text += priceDiffText(price);
  });

  text += `\n\n⚡ <b>Média: ${averagePrice}€ </b>`;
  text += priceDiffText(averagePrice);

  if (fixedPrice) {
    text += `\n📌 Preço fixo: <b>${fixedPrice}€</b>`;
  }

  text += `\n\n💡 <b>Custo estimado para 1 hora de uso:</b>\n`;

  const costs = calculateCosts(averagePrice, fixedPrice);
  for (const device of costs) {
    text += `\n${device.name}: <b>${device.cost.toFixed(2)}€</b> (<b>${device.costFixed.toFixed(2)}€</b>).`;
  }

  return telegram.sendMessage(text, chatId);
};

const sendErrorMessage = (message, chatId = null) => {
  const text = `❌ Erro: ${message}`;
  return telegram.sendMessage(text, chatId);
};

const sendCsvDownloadErrorMessage = (message, chatId = null) => {
  const text = `❌ Erro ao descarregar o ficheiro CSV: ${message}`;
  return telegram.sendMessage(text, chatId);
};

const sendHelpMessage = (chatId = null) => {
  const text =
    `❓ Comandos disponíveis:\n` +
    `/preco - Ver preço e custos atuais\n` +
    `/hoje - Ver preços do dia\n` +
    `/amanha - Ver preços de amanhã\n` +
    `/atualizar - Atualizar o ficheiro CSV`;
  return telegram.sendMessage(text, chatId);
};

export {
  sendCsvDownloadErrorMessage,
  sendErrorMessage,
  sendFileUpdatedMessage,
  sendHelpMessage,
  sendPriceFoundMessage,
  sendPriceNotFoundMessage,
  sendPricesFoundMessage,
  sendTodayPricesMessage,
  sendTomorrowPricesMessage,
};
