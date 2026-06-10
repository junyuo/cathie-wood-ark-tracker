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

Key generated files:

- `latest_holdings.json`: latest normalized ETF holdings.
- `holdings_history.json`: accumulated normalized holding snapshots.
- `daily_trades.json`: inferred snapshot-to-snapshot holding changes.
- `top_buys.json` and `top_sells.json`: largest inferred changes by estimated market value change.
- `data_status.json`: last successful update, per-ETF fetch status, warnings, and sample-data status.

If ARK's site blocks or changes the public CSV source, the update workflow preserves the existing published holdings and records the failure in `data_status.json`.

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

In the repository settings, set **Pages > Build and deployment > Source** to **GitHub Actions**. If GitHub Pages is configured to deploy from the branch root, it will serve the unbuilt Vite `index.html` and the page will appear blank.

No paid API and no API key are required.

## Data Limitations and Disclaimer

Holdings files are public ETF disclosures and may lag actual portfolio activity. Calculated trade actions compare disclosed share counts between the latest two available snapshots; they are derived changes, not broker trade confirmations and not Cathie Wood personal account transactions.

Performance data is intentionally a placeholder in the MVP until a reliable no-key market data source is added. This site is for research and informational use only and is not investment advice.
