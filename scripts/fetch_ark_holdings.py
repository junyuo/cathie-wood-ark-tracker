#!/usr/bin/env python3
"""Fetch ARK Invest public ETF holdings CSV files into raw JSON."""

from __future__ import annotations

import csv
import io
from urllib.parse import urljoin

import requests

from common import DATA_DIR, FUNDS, read_json, utc_now, write_data_status, write_json

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; cathie-wood-ark-tracker/1.0; +https://github.com/junyuo/cathie-wood-ark-tracker)",
    "Accept": "text/csv,text/plain,text/html,*/*",
}

KNOWN_URLS = (
    "https://www.ark-funds.com/wp-content/fundsiteliterature/csv/{fund}_holdings.csv",
    "https://ark-funds.com/wp-content/fundsiteliterature/csv/{fund}_holdings.csv",
    "https://assets.ark-funds.com/fund-documents/funds-etf-csv/{fund}_holdings.csv",
)

REQUIRED_HEADER_ALIASES = {
    "date": ("date", "as of date"),
    "company": ("company", "company name", "name"),
    "ticker": ("ticker", "ticker symbol"),
    "shares": ("shares",),
    "market value": ("market value($)", "market value", "marketvalue"),
    "weight": ("weight(%)", "weight", "% of fund"),
}


def candidate_urls(fund: str) -> list[str]:
    urls = [template.format(fund=fund) for template in KNOWN_URLS]
    page_url = f"https://www.ark-funds.com/funds/{fund.lower()}"
    try:
        response = requests.get(page_url, headers=HEADERS, timeout=25)
        if response.ok:
            for token in response.text.replace("\\/", "/").split('"'):
                if "csv" in token.lower() and fund.lower() in token.lower():
                    urls.insert(0, urljoin(page_url, token))
    except requests.RequestException as exc:
        print(f"{fund}: fund page discovery failed: {exc}")
    return list(dict.fromkeys(urls))


def validate_csv_headers(fieldnames: list[str] | None, fund: str, url: str) -> None:
    if not fieldnames:
        raise ValueError(f"{fund}: official CSV at {url} has no header row")
    normalized = {name.strip().lower() for name in fieldnames if name}
    missing = [
        canonical
        for canonical, aliases in REQUIRED_HEADER_ALIASES.items()
        if not any(alias.lower() in normalized for alias in aliases)
    ]
    if missing:
        raise ValueError(
            f"{fund}: official CSV format changed at {url}; missing expected columns: {', '.join(missing)}; received: {', '.join(fieldnames)}"
        )


def fetch_fund(fund: str) -> tuple[list[dict], str]:
    errors: list[str] = []
    for url in candidate_urls(fund):
        try:
            response = requests.get(url, headers=HEADERS, timeout=25)
            response.raise_for_status()
            if "ticker" not in response.text.lower():
                raise ValueError("response does not look like holdings CSV")
            rows = []
            reader = csv.DictReader(io.StringIO(response.text))
            validate_csv_headers(reader.fieldnames, fund, url)
            for row in reader:
                if any(row.values()):
                    row["_fund"] = fund
                    row["_sourceUrl"] = url
                    row["_updatedAt"] = utc_now()
                    rows.append(row)
            return rows, ""
        except (requests.RequestException, ValueError) as exc:
            errors.append(f"{url}: {exc}")
    return [], "; ".join(errors)


def main() -> None:
    all_rows: list[dict] = []
    errors: dict[str, str] = {}
    for fund in FUNDS:
        rows, error = fetch_fund(fund)
        if rows:
            print(f"{fund}: fetched {len(rows)} rows")
            all_rows.extend(rows)
        else:
            print(f"{fund}: failed - {error}")
            errors[fund] = error
    write_json(DATA_DIR / "raw_holdings.json", {"rows": all_rows, "errors": errors})
    print(f"Wrote {len(all_rows)} raw rows")
    if not all_rows:
        existing = read_json(DATA_DIR / "latest_holdings.json", [])
        write_data_status(
            rows=existing,
            errors=errors,
            warnings=["ARK holdings fetch failed for all configured ETFs. Existing published data was preserved."],
            is_sample_data=read_json(DATA_DIR / "data_status.json", {}).get("isSampleData", True),
        )
        raise SystemExit("No ARK holdings downloaded from official public sources. See per-fund errors above.")


if __name__ == "__main__":
    main()
