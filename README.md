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

The fetch script downloads public holdings CSV files from ARK Invest's official asset host. ARK's current files use full fund names in their filenames rather than ticker-only paths. Fund-page link discovery remains a fallback if those asset paths change. Frontend pages read static JSON from `public/data/*.json`.

If ARK changes the public CSV format, the fetch/normalize scripts fail with a clear message that lists missing expected columns instead of publishing empty holdings or fake data.

## Data Fields

Each normalized holding contains:

- `fund`
- `fundName`
- `date`
- `company`
- `ticker`
- `cusip`
- `shares`
- `marketValue`
- `weight`
- `sourceUrl`
- `updatedAt`
- `rankInFund`
- `heldByFundCount`
- `heldByFunds`

`shares`, `marketValue`, and `weight` are numeric. The parser handles commas, currency symbols, percent signs, empty values, and `N/A`.

`rankInFund` is calculated from latest holdings by ETF weight. `heldByFunds` and `heldByFundCount` show whether the same ticker appears across multiple ARK ETFs.

Each inferred daily change contains:

- `date`
- `fund`
- `ticker`
- `company`
- `previousShares`
- `currentShares`
- `shareChange`
- `shareChangePercent`
- `previousWeight`
- `currentWeight`
- `weightChange`
- `action`
- `sourceUrl`

## Action Logic

Actions are inferred primarily from share-count changes:

- Previous snapshot missing and current snapshot present: `New Position`
- Current shares greater than previous shares: `Buy`
- Current shares less than previous shares: `Sell`
- Previous snapshot present and current snapshot missing: `Sold Out`
- Shares unchanged: `Unchanged`

If share counts are unavailable and normalize to zero in both snapshots, market value or weight changes may be used as a fallback signal. Weight alone is not used when share counts are available because weight can move due to price changes.

## Data Status

`public/data/data_status.json` records whether the current static data is fresh and complete:

- `lastSuccessfulUpdate`
- `latestHoldingDate`
- `freshnessStatus`
- `dataAgeDays`
- `isSampleData`
- `funds.{ETF}.status`
- `funds.{ETF}.rowCount`
- `funds.{ETF}.sourceUrl`
- `funds.{ETF}.error`
- `warnings`

When bundled sample data is active, each ETF status is marked `sample` instead of `success`. A `success` status means the row came from a completed official ARK source update.

If a fetch or validation step fails, the scripts preserve the last successful `latest_holdings.json` and `holdings_history.json` instead of publishing empty or partial data. The failure is written to `data_status.json` and shown in the Dashboard Data Quality section.

`public/data/fetch_diagnostics.json` records the fetch root-cause evidence for each attempted official source:

- fund page discovery status, content type, excerpt, and discovered CSV URLs
- candidate CSV URL status, content type, response excerpt, parsed headers, row count, and error
- per-ETF errors

The GitHub Actions update workflow commits `data_status.json` and `fetch_diagnostics.json` even when the data update fails, then marks the workflow failed. This keeps the last good holdings intact while still publishing enough evidence to debug source URL, blocking, or format changes.

## Trades Summary

The Trades page summarizes inferred changes with Buy, Sell, New Position, Sold Out, positive share change, and negative share change counts. Filters can isolate New Position, Sold Out, or large absolute share changes.

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

For no-network parser checks:

```bash
python scripts/test_data_processing.py
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

If GitHub Pages deployment logs show `DEP0040 punycode` and then `The operation was canceled`, the warning is not the failure. It usually means the workflow run itself was canceled while `deploy-pages` was fetching the `github-pages` artifact. Push the latest workflow file before rerunning; old runs may still show a different deploy action version and cancellation behavior.

## Disclaimer

This site is for research and education only and is not investment advice. Users should verify important holdings data with official ARK Invest sources.
