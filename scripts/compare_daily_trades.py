#!/usr/bin/env python3
"""Compare the latest two holding dates and derive daily trade actions."""

from __future__ import annotations

import json
from pathlib import Path

DATA_DIR = Path("public/data")
HISTORY_PATH = DATA_DIR / "holdings_history.json"
TRADES_PATH = DATA_DIR / "daily_trades.json"
TOP_BUYS_PATH = DATA_DIR / "top_buys.json"
TOP_SELLS_PATH = DATA_DIR / "top_sells.json"


def action_for(previous: dict | None, current: dict | None, shares_change: int) -> str:
    if previous is None and current is not None:
        return "New Position"
    if previous is not None and current is None:
        return "Sold Out"
    if shares_change > 0:
        return "Buy"
    if shares_change < 0:
        return "Sell"
    return "Unchanged"


def main() -> None:
    history = json.loads(HISTORY_PATH.read_text(encoding="utf-8"))
    dates = sorted({item["date"] for item in history if item.get("date")})
    if len(dates) < 2:
        TRADES_PATH.write_text("[]\n", encoding="utf-8")
        TOP_BUYS_PATH.write_text("[]\n", encoding="utf-8")
        TOP_SELLS_PATH.write_text("[]\n", encoding="utf-8")
        print("Need at least two dates to compare daily trades")
        return

    previous_date, current_date = dates[-2], dates[-1]
    previous_rows = {(item["fund"], item["ticker"]): item for item in history if item["date"] == previous_date}
    current_rows = {(item["fund"], item["ticker"]): item for item in history if item["date"] == current_date}
    keys = sorted(set(previous_rows) | set(current_rows))
    trades: list[dict] = []

    for key in keys:
        previous = previous_rows.get(key)
        current = current_rows.get(key)
        display = current or previous
        previous_shares = int(previous["shares"]) if previous else 0
        current_shares = int(current["shares"]) if current else 0
        shares_change = current_shares - previous_shares
        percent_change = None if previous_shares == 0 else round((shares_change / previous_shares) * 100, 4)
        trade = {
            "fund": display["fund"],
            "date": current_date,
            "company": display["company"],
            "ticker": display["ticker"],
            "action": action_for(previous, current, shares_change),
            "previousShares": previous_shares,
            "currentShares": current_shares,
            "sharesChange": shares_change,
            "percentChange": percent_change,
            "marketValue": current["marketValue"] if current else 0,
            "weight": current["weight"] if current else 0,
            "sourceUrl": display.get("sourceUrl", ""),
            "updatedAt": display.get("updatedAt", ""),
        }
        trades.append(trade)

    top_buys = sorted([item for item in trades if item["sharesChange"] > 0], key=lambda item: item["sharesChange"], reverse=True)[:25]
    top_sells = sorted([item for item in trades if item["sharesChange"] < 0], key=lambda item: item["sharesChange"])[:25]
    TRADES_PATH.write_text(json.dumps(trades, indent=2), encoding="utf-8")
    TOP_BUYS_PATH.write_text(json.dumps(top_buys, indent=2), encoding="utf-8")
    TOP_SELLS_PATH.write_text(json.dumps(top_sells, indent=2), encoding="utf-8")
    print(f"Wrote {len(trades)} trades comparing {previous_date} to {current_date}")


if __name__ == "__main__":
    main()
