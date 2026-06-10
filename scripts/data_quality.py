#!/usr/bin/env python3
"""Shared validation and status helpers for ARK holdings data."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

FUNDS = ("ARKK", "ARKW", "ARKG", "ARKQ", "ARKF", "ARKX")
REQUIRED_FIELDS = ("fund", "date", "company", "ticker", "shares", "marketValue", "weight", "sourceUrl", "updatedAt")
DATA_DIR = Path("public/data")
STATUS_PATH = DATA_DIR / "data_status.json"
RAW_PATH = DATA_DIR / "raw_holdings.json"
LATEST_PATH = DATA_DIR / "latest_holdings.json"
HISTORY_PATH = DATA_DIR / "holdings_history.json"


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def read_json(path: Path, fallback: Any) -> Any:
    if not path.exists():
        return fallback
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return fallback


def latest_date(rows: list[dict]) -> str | None:
    dates = sorted({item.get("date", "") for item in rows if item.get("date")})
    return dates[-1] if dates else None


def freshness_for(date_value: str | None) -> tuple[str, int | None]:
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


def build_fund_status(rows: list[dict], errors: dict[str, str]) -> dict[str, dict]:
    status: dict[str, dict] = {}
    for fund in FUNDS:
        fund_rows = [item for item in rows if item.get("fund") == fund]
        source_url = next((item.get("sourceUrl", "") for item in fund_rows if item.get("sourceUrl")), "")
        if errors.get(fund):
            state = "failed"
            error = errors[fund]
        elif fund_rows:
            state = "success"
            error = ""
        else:
            state = "missing"
            error = "No rows returned for this ETF."

        status[fund] = {
            "status": state,
            "rowCount": len(fund_rows),
            "sourceUrl": source_url,
            "error": error,
        }
    return status


def validate_holdings(rows: list[dict], existing_history: list[dict]) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []

    for fund in FUNDS:
        fund_rows = [item for item in rows if item.get("fund") == fund]
        if not fund_rows:
            warnings.append(f"{fund} has no rows in the latest candidate data.")
            continue

        total_weight = sum(float(item.get("weight") or 0) for item in fund_rows)
        if total_weight < 80 or total_weight > 105:
            warnings.append(f"{fund} weight total is {total_weight:.2f}%, outside the expected 80%-105% range.")

    for index, item in enumerate(rows):
        missing = [field for field in REQUIRED_FIELDS if item.get(field) in (None, "")]
        if missing:
            errors.append(f"Row {index + 1} is missing required fields: {', '.join(missing)}.")

    candidate_date = latest_date(rows)
    previous_date = latest_date(existing_history)
    if candidate_date and previous_date and candidate_date < previous_date:
        errors.append(f"Candidate latest date {candidate_date} is older than existing history date {previous_date}.")

    return errors, warnings


def write_status(
    *,
    rows: list[dict],
    errors: dict[str, str] | None = None,
    warnings: list[str] | None = None,
    is_sample_data: bool,
    last_successful_update: str | None = None,
) -> None:
    previous = read_json(STATUS_PATH, {})
    previous_last_success = previous.get("lastSuccessfulUpdate")
    row_date = latest_date(rows)
    freshness_status, data_age_days = freshness_for(row_date or previous.get("latestHoldingDate"))
    payload = {
        "lastSuccessfulUpdate": last_successful_update or previous_last_success,
        "latestHoldingDate": row_date or previous.get("latestHoldingDate"),
        "freshnessStatus": freshness_status,
        "dataAgeDays": data_age_days,
        "isSampleData": is_sample_data,
        "funds": build_fund_status(rows, errors or {}),
        "warnings": warnings or [],
        "updatedAt": utc_now(),
    }
    STATUS_PATH.write_text(json.dumps(payload, indent=2), encoding="utf-8")
