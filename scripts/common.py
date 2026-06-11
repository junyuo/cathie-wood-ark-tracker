from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

FUNDS = {
    "ARKK": "ARK Innovation ETF",
    "ARKW": "ARK Next Generation Internet ETF",
    "ARKG": "ARK Genomic Revolution ETF",
    "ARKQ": "ARK Autonomous Technology & Robotics ETF",
    "ARKF": "ARK Fintech Innovation ETF",
    "ARKX": "ARK Space Exploration & Innovation ETF",
}

DATA_DIR = Path("public/data")


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def read_json(path: Path, fallback: Any) -> Any:
    if not path.exists():
        return fallback
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return fallback


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def parse_number(value: object) -> float:
    if value is None:
        return 0.0
    text = str(value).strip()
    if text == "" or text.upper() in {"N/A", "NA", "NULL", "NONE", "-"}:
        return 0.0
    negative = text.startswith("(") and text.endswith(")")
    cleaned = re.sub(r"[^0-9.\-]", "", text)
    if cleaned in {"", "-", ".", "-."}:
        return 0.0
    number = float(cleaned)
    return -number if negative else number


def first_value(row: dict, names: tuple[str, ...]) -> str:
    lower = {str(key).strip().lower(): value for key, value in row.items()}
    for name in names:
        value = lower.get(name.lower())
        if value not in (None, ""):
            return str(value).strip()
    return ""


def latest_date(rows: list[dict]) -> str | None:
    dates = sorted({row.get("date", "") for row in rows if row.get("date")})
    return dates[-1] if dates else None


def data_freshness(date_value: str | None) -> tuple[str, int | None]:
    if not date_value:
        return "unknown", None
    try:
        holding_date = datetime.fromisoformat(date_value).date()
    except ValueError:
        return "unknown", None
    age_days = (datetime.now(timezone.utc).date() - holding_date).days
    if age_days <= 3:
        return "fresh", age_days
    if age_days <= 7:
        return "stale", age_days
    return "old", age_days


def enrich_holdings(rows: list[dict]) -> list[dict]:
    funds_by_ticker: dict[str, set[str]] = {}
    for row in rows:
        funds_by_ticker.setdefault(row["ticker"], set()).add(row["fund"])

    enriched: list[dict] = []
    for fund in FUNDS:
        fund_rows = sorted([row for row in rows if row["fund"] == fund], key=lambda row: row["weight"], reverse=True)
        for rank, row in enumerate(fund_rows, start=1):
            held_by = sorted(funds_by_ticker.get(row["ticker"], set()))
            enriched.append(
                {
                    **row,
                    "rankInFund": rank,
                    "heldByFundCount": len(held_by),
                    "heldByFunds": held_by,
                }
            )
    return enriched


def build_fund_status(rows: list[dict], errors: dict[str, str] | None = None) -> dict[str, dict]:
    errors = errors or {}
    status: dict[str, dict] = {}
    for fund in FUNDS:
        fund_rows = [row for row in rows if row.get("fund") == fund]
        source_url = next((row.get("sourceUrl", "") for row in fund_rows if row.get("sourceUrl")), "")
        if errors.get(fund):
            state = "failed"
            error = errors[fund]
        elif fund_rows:
            state = "success"
            error = ""
        else:
            state = "missing"
            error = "No holdings rows available for this ETF."
        status[fund] = {"status": state, "rowCount": len(fund_rows), "sourceUrl": source_url, "error": error}
    return status


def write_data_status(
    *,
    rows: list[dict],
    errors: dict[str, str] | None = None,
    warnings: list[str] | None = None,
    is_sample_data: bool,
    last_successful_update: str | None = None,
) -> None:
    date_value = latest_date(rows)
    freshness_status, data_age_days = data_freshness(date_value)
    previous = read_json(DATA_DIR / "data_status.json", {})
    payload = {
        "lastSuccessfulUpdate": last_successful_update or previous.get("lastSuccessfulUpdate"),
        "latestHoldingDate": date_value or previous.get("latestHoldingDate"),
        "freshnessStatus": freshness_status,
        "dataAgeDays": data_age_days,
        "isSampleData": is_sample_data,
        "funds": build_fund_status(rows, errors),
        "warnings": warnings or [],
        "updatedAt": utc_now(),
    }
    write_json(DATA_DIR / "data_status.json", payload)
