# Cathie Wood ARK Tracker

Static dashboard for tracking daily public holdings and holding changes in Cathie Wood's ARK Invest ETFs.

This project tracks ARK ETF public holdings disclosures. It is not a record of Cathie Wood's personal brokerage account, personal trades, or private transactions.

## Supported ETFs

- ARKK
- ARKW
- ARKG
- ARKQ
- ARKF
- ARKX

## Data Source

The Python fetch script downloads public CSV holdings files from ARK Invest's official site:

`https://ark-funds.com/wp-content/fundsiteliterature/csv/{FUND}_holdings.csv`

Every normalized row keeps `sourceUrl` and `updatedAt` so the frontend can show where and when the data was produced.

## Local Development

```bash
npm install
npm run dev
```

## Fetch Data

```bash
pip install -r requirements.txt
python scripts/fetch_ark_holdings.py
python scripts/normalize_holdings.py
python scripts/compare_daily_trades.py
python scripts/calculate_performance.py
```

Generated data lives in `public/data`.

## Build

```bash
npm run build
```

The Vite base path is configured for the repository name:

```ts
base: "/cathie-wood-ark-tracker/"
```

The app uses React Router `HashRouter` so GitHub Pages refreshes do not produce 404 errors.

## GitHub Actions

- `.github/workflows/update-data.yml` fetches and commits updated JSON data on weekdays.
- `.github/workflows/deploy-pages.yml` builds the Vite app and deploys `dist` to GitHub Pages.

No paid API and no API key are required.

## Data Limitations and Disclaimer

Holdings files are public ETF disclosures and may lag actual portfolio activity. Calculated trade actions compare disclosed share counts between the latest two available snapshots; they are derived changes, not broker trade confirmations.

Performance data is intentionally a placeholder in the MVP until a reliable no-key market data source is added. This site is for research and informational use only and is not investment advice.
