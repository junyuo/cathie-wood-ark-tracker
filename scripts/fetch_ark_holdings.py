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

ASSET_BASE_URL = "https://assets.ark-funds.com/fund-documents/funds-etf-csv"

# ARK's current public asset filenames use fund names rather than only tickers.
# ARKF and ARKX keep their previous filenames as fallbacks after their 2025
# fund-name changes.
OFFICIAL_ASSET_FILENAMES = {
    "ARKK": ("ARK_INNOVATION_ETF_ARKK_HOLDINGS.csv",),
    "ARKW": ("ARK_NEXT_GENERATION_INTERNET_ETF_ARKW_HOLDINGS.csv",),
    "ARKG": ("ARK_GENOMIC_REVOLUTION_ETF_ARKG_HOLDINGS.csv",),
    "ARKQ": ("ARK_AUTONOMOUS_TECH._&_ROBOTICS_ETF_ARKQ_HOLDINGS.csv",),
    "ARKF": (
        "ARK_BLOCKCHAIN_&_FINTECH_INNOVATION_ETF_ARKF_HOLDINGS.csv",
        "ARK_FINTECH_INNOVATION_ETF_ARKF_HOLDINGS.csv",
    ),
    "ARKX": (
        "ARK_SPACE_&_DEFENSE_INNOVATION_ETF_ARKX_HOLDINGS.csv",
        "ARK_SPACE_EXPLORATION_&_INNOVATION_ETF_ARKX_HOLDINGS.csv",
    ),
}

LEGACY_URLS = (
    "https://www.ark-funds.com/wp-content/fundsiteliterature/csv/{fund}_holdings.csv",
    "https://ark-funds.com/wp-content/fundsiteliterature/csv/{fund}_holdings.csv",
)

REQUIRED_HEADER_ALIASES = {
    "date": ("date", "as of date"),
    "company": ("company", "company name", "name"),
    "ticker": ("ticker", "ticker symbol"),
    "shares": ("shares",),
    "market value": ("market value ($)", "market value($)", "market value", "marketvalue"),
    "weight": ("weight (%)", "weight(%)", "weight", "% of fund"),
}


def response_excerpt(text: str, limit: int = 300) -> str:
    return " ".join(text[:limit].split())


def static_candidate_urls(fund: str) -> list[str]:
    filenames = OFFICIAL_ASSET_FILENAMES.get(fund, ())
    official_urls = [f"{ASSET_BASE_URL}/{filename}" for filename in filenames]
    legacy_urls = [template.format(fund=fund) for template in LEGACY_URLS]
    return official_urls + legacy_urls


def discover_candidate_urls(fund: str, diagnostics: list[dict]) -> list[str]:
    page_url = f"https://www.ark-funds.com/funds/{fund.lower()}"
    page_diagnostic = {
        "fund": fund,
        "stage": "fund-page-discovery",
        "url": page_url,
        "statusCode": None,
        "contentType": "",
        "excerpt": "",
        "discoveredUrls": [],
        "error": "",
    }
    try:
        response = requests.get(page_url, headers=HEADERS, timeout=25)
        page_diagnostic["statusCode"] = response.status_code
        page_diagnostic["contentType"] = response.headers.get("content-type", "")
        page_diagnostic["excerpt"] = response_excerpt(response.text)
        if response.ok:
            for token in response.text.replace("\\/", "/").split('"'):
                if "csv" in token.lower() and fund.lower() in token.lower():
                    discovered_url = urljoin(page_url, token)
                    page_diagnostic["discoveredUrls"].append(discovered_url)
    except requests.RequestException as exc:
        page_diagnostic["error"] = str(exc)
        print(f"{fund}: fund page discovery failed: {exc}")
    diagnostics.append(page_diagnostic)
    return list(dict.fromkeys(page_diagnostic["discoveredUrls"]))


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


def fetch_candidate(fund: str, url: str, diagnostics: list[dict]) -> tuple[list[dict], str]:
    attempt = {
        "fund": fund,
        "stage": "holdings-csv",
        "url": url,
        "statusCode": None,
        "contentType": "",
        "excerpt": "",
        "rowCount": 0,
        "headers": [],
        "error": "",
    }
    try:
        response = requests.get(url, headers=HEADERS, timeout=25)
        attempt["statusCode"] = response.status_code
        attempt["contentType"] = response.headers.get("content-type", "")
        attempt["excerpt"] = response_excerpt(response.text)
        response.raise_for_status()
        if "ticker" not in response.text.lower():
            raise ValueError("response does not look like holdings CSV")
        rows = []
        reader = csv.DictReader(io.StringIO(response.text))
        attempt["headers"] = reader.fieldnames or []
        validate_csv_headers(reader.fieldnames, fund, url)
        for row in reader:
            if any(row.values()):
                row["_fund"] = fund
                row["_sourceUrl"] = url
                row["_updatedAt"] = utc_now()
                rows.append(row)
        attempt["rowCount"] = len(rows)
        diagnostics.append(attempt)
        return rows, ""
    except (requests.RequestException, ValueError) as exc:
        attempt["error"] = str(exc)
        diagnostics.append(attempt)
        return [], f"{url}: {exc}"


def fetch_fund(fund: str, diagnostics: list[dict]) -> tuple[list[dict], str]:
    errors: list[str] = []
    attempted_urls: set[str] = set()

    for url in static_candidate_urls(fund):
        attempted_urls.add(url)
        rows, error = fetch_candidate(fund, url, diagnostics)
        if rows:
            return rows, ""
        errors.append(error)

    # Fund pages and the document API may reject automated clients. Discovery
    # remains a last-resort fallback if the known official asset paths change.
    for url in discover_candidate_urls(fund, diagnostics):
        if url in attempted_urls:
            continue
        rows, error = fetch_candidate(fund, url, diagnostics)
        if rows:
            return rows, ""
        errors.append(error)

    return [], "; ".join(errors)


def main() -> None:
    all_rows: list[dict] = []
    errors: dict[str, str] = {}
    diagnostics: list[dict] = []
    for fund in FUNDS:
        rows, error = fetch_fund(fund, diagnostics)
        if rows:
            print(f"{fund}: fetched {len(rows)} rows")
            all_rows.extend(rows)
        else:
            print(f"{fund}: failed - {error}")
            errors[fund] = error
    write_json(DATA_DIR / "raw_holdings.json", {"rows": all_rows, "errors": errors})
    write_json(
        DATA_DIR / "fetch_diagnostics.json",
        {
            "updatedAt": utc_now(),
            "rowCount": len(all_rows),
            "fundsAttempted": list(FUNDS.keys()),
            "errors": errors,
            "attempts": diagnostics,
        },
    )
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
