# Cathie Wood ARK Tracker

Static GitHub Pages dashboard for tracking public ARK Invest ETF holdings and inferred holding changes.

This is not a Cathie Wood personal trading record. The site uses ARK Invest ETF public holdings disclosures and describes changes as ETF holding increases or decreases.

## Supported ETFs

- ARKK: ARK Innovation ETF
- ARKW: ARK Next Generation Internet ETF
- ARKG: ARK Genomic Revolution ETF
- ARKQ: ARK Autonomous Technology & Robotics ETF
- ARKF: ARK Fintech Innovation ETF
- ARKX: ARK Space Exploration & Innovation ETF

## Data Source

The fetch script attempts to download public holdings CSV files from ARK Invest public sources. Frontend pages read static JSON from `public/data/*.json`.

## Data Limits

Buy and Sell labels are inferred from ETF holding share-count changes between snapshots. They are not broker confirmations, real-time trades, or Cathie Wood personal transactions. ETF creations, redemptions, market movement, disclosure delays, and data format changes may affect results.

Performance pages are placeholders until a reliable no-key price data source is added. The project does not generate fake CAGR, return, drawdown, volatility, or Sharpe values.

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
python scripts/calculate_summary.py
python scripts/calculate_performance.py
```

## Build

```bash
npm run build
```

## GitHub Pages Deployment

The Vite base path is configured for this repository:

```ts
base: "/cathie-wood-ark-tracker/"
```

The app uses `HashRouter` to avoid GitHub Pages refresh 404s. In GitHub repository settings, set Pages source to GitHub Actions.

## GitHub Actions

- `deploy-pages.yml`: builds with `npm ci` and deploys `dist`.
- `update-data.yml`: runs Tuesday through Saturday and can be triggered manually to update `public/data/*.json`.

## Disclaimer

This site is for research and education only and is not investment advice. Users should verify important holdings data with official ARK Invest sources.
