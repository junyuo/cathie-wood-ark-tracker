#!/usr/bin/env python3
"""Fetch ARK Invest public ETF holdings CSV files and write raw JSON rows."""

from __future__ import annotations

import csv
import io
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin

import requests

FUNDS = ("ARKK", "ARKW", "ARKG", "ARKQ", "ARKF", "ARKX")
FUND_PAGE_URL = "https://www.ark-funds.com/funds/{fund}"
KNOWN_CSV_URLS = (
    "https://www.ark-funds.com/wp-content/fundsiteliterature/csv/{fund}_holdings.csv",
    "https://ark-funds.com/wp-content/fundsiteliterature/csv/{fund}_holdings.csv",
    "https://assets.ark-funds.com/fund-documents/funds-etf-csv/{fund}_holdings.csv",
)
DATA_DIR = Path("public/data")
RAW_PATH = DATA_DIR / "raw_holdings.json"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; cathie-wood-ark-tracker/0.1; +https://github.com/)",
    "Accept": "text/csv,text/plain,text/html,application/xhtml+xml,*/*",
}


def candidate_urls(fund: str) -> list[str]:
    urls: list[str] = []
    page_url = FUND_PAGE_URL.format(fund=fund.lower())
    try:
        page = requests.get(page_url, headers=HEADERS, timeout=30)
        page.raise_for_status()
        matches = re.findall(r"""["']([^"']*(?:csv|holdings)[^"']*)["']""", page.text, re.IGNORECASE)
        for match in matches:
            if fund.lower() in match.lower() and "csv" in match.lower():
                urls.append(urljoin(page_url, match.replace("\\/", "/")))
    except requests.RequestException:
        pass

    urls.extend(url.format(fund=fund) for url in KNOWN_CSV_URLS)
    return list(dict.fromkeys(urls))


def fetch_fund(fund: str) -> list[dict]:
    response: requests.Response | None = None
    source_url = ""
    errors: list[str] = []

    for url in candidate_urls(fund):
        try:
            candidate = requests.get(url, headers=HEADERS, timeout=30)
            candidate.raise_for_status()
            if "ticker" not in candidate.text.lower() and "company" not in candidate.text.lower():
                raise ValueError("response does not look like holdings CSV")
            response = candidate
            source_url = url
            break
        except (requests.RequestException, ValueError) as exc:
            errors.append(f"{url}: {exc}")

    if response is None:
        raise RuntimeError("; ".join(errors))

    reader = csv.DictReader(io.StringIO(response.text))
    updated_at = datetime.now(timezone.utc).isoformat()
    rows: list[dict] = []

    for row in reader:
        if not any(row.values()):
            continue
        row["_fund"] = fund
        row["_sourceUrl"] = source_url
        row["_updatedAt"] = updated_at
        rows.append(row)

    return rows


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    raw_rows: list[dict] = []
    errors: dict[str, str] = {}

    for fund in FUNDS:
        try:
            fund_rows = fetch_fund(fund)
            raw_rows.extend(fund_rows)
            print(f"{fund}: fetched {len(fund_rows)} rows")
        except (requests.RequestException, RuntimeError) as exc:
            errors[fund] = str(exc)
            print(f"{fund}: failed - {exc}")

    RAW_PATH.write_text(json.dumps({"rows": raw_rows, "errors": errors}, indent=2), encoding="utf-8")
    print(f"Wrote {len(raw_rows)} raw holdings to {RAW_PATH}")
    if errors:
        print(f"Warnings: {errors}")
    if not raw_rows:
        print("No ARK holdings downloaded. Existing published data will be preserved by the normalize step.")


if __name__ == "__main__":
    main()
