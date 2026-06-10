#!/usr/bin/env python3
"""Normalize ARK holdings into the frontend JSON schema."""

from __future__ import annotations

import json
import re
from pathlib import Path

from data_quality import FUNDS, HISTORY_PATH, LATEST_PATH, RAW_PATH, STATUS_PATH, read_json, utc_now, validate_holdings, write_status

DATA_DIR = Path("public/data")


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
    raw_errors = raw_payload.get("errors", {})
    latest = [normalize(row) for row in raw_payload["rows"]]
    latest = [item for item in latest if item["fund"] and item["date"] and item["ticker"]]

    existing_history: list[dict] = []
    if HISTORY_PATH.exists():
        existing_history = json.loads(HISTORY_PATH.read_text(encoding="utf-8"))

    if not latest:
        existing_latest = json.loads(LATEST_PATH.read_text(encoding="utf-8")) if LATEST_PATH.exists() else []
        previous_status = read_json(STATUS_PATH, {"isSampleData": True})
        write_status(
            rows=existing_latest,
            errors={fund: raw_errors.get(fund, "No rows returned for this ETF.") for fund in FUNDS},
            warnings=["ARK holdings fetch returned no usable rows. Existing published data was preserved."],
            is_sample_data=bool(previous_status.get("isSampleData", True)),
        )
        print("No normalized holdings were available. Existing holdings were preserved and data_status.json was updated.")
        return

    validation_errors, warnings = validate_holdings(latest, existing_history)
    if validation_errors:
        existing_latest = json.loads(LATEST_PATH.read_text(encoding="utf-8")) if LATEST_PATH.exists() else []
        previous_status = read_json(STATUS_PATH, {"isSampleData": True})
        write_status(
            rows=existing_latest,
            errors={fund: "; ".join(validation_errors) for fund in FUNDS},
            warnings=warnings + ["Candidate data failed validation. Existing published data was preserved."],
            is_sample_data=bool(previous_status.get("isSampleData", True)),
        )
        print("Candidate holdings failed validation. Existing holdings were preserved and data_status.json was updated.")
        for error in validation_errors:
            print(f"Validation error: {error}")
        return

    history = dedupe_history(existing_history + latest)
    LATEST_PATH.write_text(json.dumps(latest, indent=2), encoding="utf-8")
    HISTORY_PATH.write_text(json.dumps(history, indent=2), encoding="utf-8")
    write_status(rows=latest, errors=raw_errors, warnings=warnings, is_sample_data=False, last_successful_update=utc_now())
    print(f"Wrote {len(latest)} latest holdings and {len(history)} history rows")


if __name__ == "__main__":
    main()
