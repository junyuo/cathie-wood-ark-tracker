#!/usr/bin/env python3
"""Normalize raw ARK holdings into frontend JSON schema."""

from __future__ import annotations

from common import DATA_DIR, FUNDS, first_value, parse_number, read_json, utc_now, write_json


REQUIRED_OUTPUT_FIELDS = ("fund", "fundName", "date", "company", "ticker", "shares", "marketValue", "weight", "sourceUrl", "updatedAt")


def normalize(row: dict) -> dict:
    fund = row.get("_fund") or first_value(row, ("fund",))
    return {
        "fund": fund,
        "fundName": FUNDS.get(fund, fund),
        "date": first_value(row, ("date", "as of date")),
        "company": first_value(row, ("company", "company name", "name")),
        "ticker": first_value(row, ("ticker", "ticker symbol")).upper(),
        "cusip": first_value(row, ("cusip",)),
        "shares": int(parse_number(first_value(row, ("shares",)))),
        "marketValue": parse_number(first_value(row, ("market value($)", "market value", "marketvalue"))),
        "weight": parse_number(first_value(row, ("weight(%)", "weight", "% of fund"))),
        "sourceUrl": row.get("_sourceUrl", ""),
        "updatedAt": row.get("_updatedAt", utc_now()),
    }


def validate_latest(rows: list[dict]) -> None:
    if not rows:
        raise ValueError("No normalized holding rows were produced.")
    errors: list[str] = []
    funds_present = {row.get("fund") for row in rows}
    missing_funds = [fund for fund in FUNDS if fund not in funds_present]
    if missing_funds:
        errors.append(f"missing holdings for required funds: {', '.join(missing_funds)}")
    for index, row in enumerate(rows, start=1):
        missing = [field for field in REQUIRED_OUTPUT_FIELDS if row.get(field) in (None, "")]
        if missing:
            errors.append(f"row {index} missing required fields: {', '.join(missing)}")
        if row.get("fund") not in FUNDS:
            errors.append(f"row {index} has unsupported fund: {row.get('fund')}")
        for field in ("shares", "marketValue", "weight"):
            if not isinstance(row.get(field), (int, float)):
                errors.append(f"row {index} field {field} is not numeric")
    if errors:
        raise ValueError("Invalid normalized holdings:\n" + "\n".join(errors))


def main() -> None:
    raw = read_json(DATA_DIR / "raw_holdings.json", {"rows": [], "errors": {}})
    latest = [normalize(row) for row in raw["rows"]]
    latest = [row for row in latest if row["fund"] and row["date"] and row["ticker"]]
    if not latest:
        print("No normalized rows. Existing public data preserved.")
        return

    try:
        validate_latest(latest)
    except ValueError as exc:
        raise SystemExit(str(exc)) from exc
    history = read_json(DATA_DIR / "holdings_history.json", [])
    by_key = {(row["fund"], row["date"], row["ticker"]): row for row in history + latest}
    write_json(DATA_DIR / "latest_holdings.json", latest)
    write_json(DATA_DIR / "holdings_history.json", sorted(by_key.values(), key=lambda row: (row["date"], row["fund"], row["ticker"])))
    print(f"Wrote {len(latest)} latest holdings")


if __name__ == "__main__":
    main()
