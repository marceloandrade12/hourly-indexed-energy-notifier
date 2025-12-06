import { config } from "./config.js";
import { calculateCosts } from "./devices.js";
import telegram from "./telegram.js";
import { getTodayDateString, getTomorrowDateString } from "./utils.js";

const lowPrice = config.lowPrice;
const highPrice = config.highPrice;

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
      text += `  Preço às ${index}:00 - ${price} € / kWh`;
    }
  }

  return text;
};

const sendTomorrowPricesMessage = (
  pricesForTomorrow,
  beginText,
  chatId = null
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
    chatId
  );
};

const sendPriceNotFoundMessage = (date, hour, chatId = null) => {
  const text = `⚠️ Preço não encontrado para ${date} ${hour}:00`;
  return telegram.sendMessage(text, chatId);
};

const sendPriceFoundMessage = (hour, price, chatId = null) => {
  let text = "";
  text += priceEmojiAndText(price) + " \n\n";
  text += `⚡ Preço agora ${hour}:00 - <b>${price} € / kWh</b>`;

  // add devices cost message

  text += `\n\n💡 <b>Custo estimado para 1 hora de uso:</b>\n`;

  const costs = calculateCosts(price);
  for (const device of costs) {
    text += `\n${device.name} custará <b>${device.cost.toFixed(2)} €</b>.`;
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
  sendTodayPricesMessage,
  sendTomorrowPricesMessage,
};
