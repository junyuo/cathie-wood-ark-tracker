#!/usr/bin/env python3
"""Normalize ARK holdings into the frontend JSON schema."""

from __future__ import annotations

import json
import re
from pathlib import Path

DATA_DIR = Path("public/data")
RAW_PATH = DATA_DIR / "raw_holdings.json"
LATEST_PATH = DATA_DIR / "latest_holdings.json"
HISTORY_PATH = DATA_DIR / "holdings_history.json"


def parse_number(value: object) -> float:
    if value is None:
        return 0.0
    cleaned = re.sub(r"[^0-9.\-]", "", str(value))
    return float(cleaned) if cleaned else 0.0


def first_value(row: dict, names: tuple[str, ...]) -> str:
    lower_map = {key.strip().lower(): value for key, value in row.items()}
    for name in names:
        value = lower_map.get(name.lower())
        if value not in (None, ""):
            return str(value).strip()
    return ""


def normalize(row: dict) -> dict:
    fund = row.get("_fund") or first_value(row, ("fund",))
    date = first_value(row, ("date", "as of date"))
    ticker = first_value(row, ("ticker", "ticker symbol"))
    return {
        "fund": fund,
        "date": date,
        "company": first_value(row, ("company", "company name", "name")),
        "ticker": ticker,
        "cusip": first_value(row, ("cusip",)),
        "shares": int(parse_number(first_value(row, ("shares",)))),
        "marketValue": parse_number(first_value(row, ("market value($)", "market value", "marketvalue"))),
        "weight": parse_number(first_value(row, ("weight(%)", "weight", "% of fund"))),
        "sourceUrl": row.get("_sourceUrl", ""),
        "updatedAt": row.get("_updatedAt", ""),
    }


def dedupe_history(rows: list[dict]) -> list[dict]:
    by_key = {(item["fund"], item["date"], item["ticker"]): item for item in rows if item.get("ticker")}
    return sorted(by_key.values(), key=lambda item: (item["date"], item["fund"], item["ticker"]))


def main() -> None:
    raw_payload = json.loads(RAW_PATH.read_text(encoding="utf-8"))
    latest = [normalize(row) for row in raw_payload["rows"]]
    latest = [item for item in latest if item["fund"] and item["date"] and item["ticker"]]

    existing_history: list[dict] = []
    if HISTORY_PATH.exists():
        existing_history = json.loads(HISTORY_PATH.read_text(encoding="utf-8"))

    history = dedupe_history(existing_history + latest)
    LATEST_PATH.write_text(json.dumps(latest, indent=2), encoding="utf-8")
    HISTORY_PATH.write_text(json.dumps(history, indent=2), encoding="utf-8")
    print(f"Wrote {len(latest)} latest holdings and {len(history)} history rows")


if __name__ == "__main__":
    main()
