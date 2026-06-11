#!/usr/bin/env python3
"""Normalize raw ARK holdings into frontend JSON schema."""

from __future__ import annotations

import re

from common import DATA_DIR, FUNDS, read_json, utc_now, write_json


def parse_number(value: object) -> float:
    cleaned = re.sub(r"[^0-9.\-]", "", str(value or ""))
    return float(cleaned) if cleaned else 0.0


def first(row: dict, names: tuple[str, ...]) -> str:
    lower = {key.strip().lower(): value for key, value in row.items()}
    for name in names:
        value = lower.get(name.lower())
        if value not in (None, ""):
            return str(value).strip()
    return ""


def normalize(row: dict) -> dict:
    fund = row.get("_fund") or first(row, ("fund",))
    return {
        "fund": fund,
        "fundName": FUNDS.get(fund, fund),
        "date": first(row, ("date", "as of date")),
        "company": first(row, ("company", "company name", "name")),
        "ticker": first(row, ("ticker", "ticker symbol")),
        "cusip": first(row, ("cusip",)),
        "shares": int(parse_number(first(row, ("shares",)))),
        "marketValue": parse_number(first(row, ("market value($)", "market value", "marketvalue"))),
        "weight": parse_number(first(row, ("weight(%)", "weight", "% of fund"))),
        "sourceUrl": row.get("_sourceUrl", ""),
        "updatedAt": row.get("_updatedAt", utc_now()),
    }


def main() -> None:
    raw = read_json(DATA_DIR / "raw_holdings.json", {"rows": [], "errors": {}})
    latest = [normalize(row) for row in raw["rows"]]
    latest = [row for row in latest if row["fund"] and row["date"] and row["ticker"]]
    if not latest:
        print("No normalized rows. Existing public data preserved.")
        return

    history = read_json(DATA_DIR / "holdings_history.json", [])
    by_key = {(row["fund"], row["date"], row["ticker"]): row for row in history + latest}
    write_json(DATA_DIR / "latest_holdings.json", latest)
    write_json(DATA_DIR / "holdings_history.json", sorted(by_key.values(), key=lambda row: (row["date"], row["fund"], row["ticker"])))
    print(f"Wrote {len(latest)} latest holdings")


if __name__ == "__main__":
    main()
