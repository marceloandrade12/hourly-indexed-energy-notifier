import telegram from "./telegram.js";

/**
 * Sends a notification message indicating that the CSV file has been successfully updated.
 * @returns {Promise} A promise that resolves when the message has been sent.
 */
const sendFileUpdatedMessage = () => {
  const text = "📥 O ficheiro CSV foi atualizado com sucesso.";
  return telegram.sendMessage(text);
};

const sendPriceNotFoundMessage = (date, hour) => {
  const text = `⚠️ Preço não encontrado para ${date} ${hour}:00`;
  return telegram.sendMessage(text);
};

const sendPriceFoundMessage = (hour, price) => {
  let text = "";
  if (price < 0.1) {
    text += "✅ Preço baixo! \n";
  } else if (price < 0.1599) {
    text += "🆗 Preço normal.\n";
  } else {
    text += "⚠️ Preço alto! \n";
  }
  text += `⚡ Preço agora ${hour}:00 - ${price} €/kWh`;
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
