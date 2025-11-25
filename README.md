# Hourly Indexed Energy Notifier

A lightweight Node.js service that retrieves hourly indexed electricity
prices from an upstream CSV source and sends notifications to a Telegram
bot. Useful for home automations, energy‑saving workflows, and daily
monitoring.

## Features

- Fetches and converts a remote CSV with hourly indexed electricity prices.
- Filters data for provided configuration in `.env`
- **Updates the CSV once per day at 22:00**, storing it locally to avoid making unnecessary requests.
- **Sends hourly Telegram notifications** with:
  - The current hour's energy price.
  - Estimated energy cost for selected household appliances (heater, AC, washing machine, dryer, dishwasher).
- Uses `csvjson-csv2json` for fast CSV → JSON parsing.
- Uses `undici` for modern HTTP requests.
- Built for Node.js.
- Logging system compatible with `pretty-js-log`.

## Requirements

-   **Node.js** (v18+ recommended)
-   **npm**
-   **PM2** (optional but recommended for background execution)
-   **Telegram Bot Token** (from @BotFather)
-   `.env` configuration file

## Installation

``` bash
git clone https://github.com/marceloandrade12/hourly-indexed-energy-notifier.git
cd hourly-indexed-energy-notifier
npm install
```

Copy the environment template:

``` bash
cp .env.example .env
```

Edit `.env` and fill in your values.

Available Energy Suppliers ( available on CSV ) - `TARIFF`
- Alfa Power Index BTN
- Coopérnico Base
- Coopérnico GO
- EDP Indexada Horária
- EZU Tarifa Coletiva
- G9 Smart Dynamic
- Galp Plano Dinâmico
- MeoEnergia Tarifa Variável
- Repsol Leve Sem Mais

Available Energy Options ( available on CSV ) - `OPTION`
- Simples
- Bi-horário – Ciclo Diário
- Bi-horário – Ciclo Semanal
- Tri-horário – Ciclo Diário
- Tri-horário – Ciclo Semanal
- Tri-horário > 20.7 kVA – Ciclo Diário
- Tri-horário > 20.7 kVA – Ciclo Semanal

### Example
    
    TELEGRAM_BOT_TOKEN=123456:ABC...
    TELEGRAM_CHAT_ID=123456789
    CSV_SOURCE_URL=https://raw.githubusercontent.com/tiagofelicia/tiagofelicia.github.io/main/data/precos-horarios.csv
    CACHE_PATH=./cache/precos-horarios.csv
    TIMEZONE=Europe/Lisbon
    TARIFF=EDP Indexada Horária
    OPTION=Simples

## Running the Project

### Option 1 --- Normal execution

``` bash
npm start
```

### Option 2 --- With PM2

``` bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 status
```

   

## Credits

This project uses CSV data provided by **Tiago Felicia**:
- GitHub: https://github.com/tiagofelicia
- Upstream repository containing the CSV source:
https://github.com/tiagofelicia/tiagofelicia.github.io

Huge thanks to him for maintaining the public CSV source that makes this
tool possible.

## Suggested Extensions

You can expand this notifier with:

-   Cost estimation for appliances based on hourly price:
    -   Heater
    -   Air conditioner
    -   Dishwasher
    -   Washing machine
    -   Dryer
-   Multi‑user Telegram notifications.
-   Daily/weekly charts of energy prices.
-   Alerts when the price goes above/below defined thresholds.
-   Integration with Home Assistant.

## License

MIT License. Feel free to modify and extend.
