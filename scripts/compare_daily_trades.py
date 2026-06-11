#!/usr/bin/env python3
"""Compare latest two holding dates and infer ETF holding changes."""

from __future__ import annotations

from common import DATA_DIR, read_json, write_json


def infer_action(previous: dict | None, current: dict | None, share_change: int, value_change: float, weight_change: float) -> str:
    if previous is None and current is not None:
        return "New Position"
    if previous is not None and current is None:
        return "Sold Out"
    if share_change > 0:
        return "Buy"
    if share_change < 0:
        return "Sell"
    previous_shares = int(previous["shares"]) if previous else 0
    current_shares = int(current["shares"]) if current else 0
    if previous_shares == 0 and current_shares == 0:
        if value_change > 0 or weight_change > 0:
            return "Buy"
        if value_change < 0 or weight_change < 0:
            return "Sell"
    return "Unchanged"


def main() -> None:
    history = read_json(DATA_DIR / "holdings_history.json", [])
    dates = sorted({row["date"] for row in history if row.get("date")})
    if len(dates) < 2:
        print("Need at least two holding dates to compare trades")
        return
    previous_date, current_date = dates[-2], dates[-1]
    previous = {(row["fund"], row["ticker"]): row for row in history if row["date"] == previous_date}
    current = {(row["fund"], row["ticker"]): row for row in history if row["date"] == current_date}
    trades = []
    for key in sorted(set(previous) | set(current)):
        prev = previous.get(key)
        curr = current.get(key)
        display = curr or prev
        previous_shares = int(prev["shares"]) if prev else 0
        current_shares = int(curr["shares"]) if curr else 0
        share_change = current_shares - previous_shares
        previous_weight = float(prev["weight"]) if prev else 0.0
        current_weight = float(curr["weight"]) if curr else 0.0
        previous_market_value = float(prev["marketValue"]) if prev else 0.0
        current_market_value = float(curr["marketValue"]) if curr else 0.0
        value_change = current_market_value - previous_market_value
        weight_change = round(current_weight - previous_weight, 4)
        trades.append(
            {
                "date": current_date,
                "fund": display["fund"],
                "ticker": display["ticker"],
                "company": display["company"],
                "previousShares": previous_shares,
                "currentShares": current_shares,
                "shareChange": share_change,
                "shareChangePercent": None if previous_shares == 0 else round((share_change / previous_shares) * 100, 4),
                "previousWeight": previous_weight,
                "currentWeight": current_weight,
                "weightChange": weight_change,
                "previousMarketValue": previous_market_value,
                "currentMarketValue": current_market_value,
                "marketValueChange": round(value_change, 2),
                "action": infer_action(prev, curr, share_change, value_change, weight_change),
                "sourceUrl": display.get("sourceUrl", ""),
            }
        )
    write_json(DATA_DIR / "daily_trades.json", trades)
    write_json(
        DATA_DIR / "top_buys.json",
        sorted([row for row in trades if row["marketValueChange"] > 0], key=lambda row: row["marketValueChange"], reverse=True)[:25],
    )
    write_json(
        DATA_DIR / "top_sells.json",
        sorted([row for row in trades if row["marketValueChange"] < 0], key=lambda row: row["marketValueChange"])[:25],
    )
    print(f"Wrote {len(trades)} inferred changes")


if __name__ == "__main__":
    main()
