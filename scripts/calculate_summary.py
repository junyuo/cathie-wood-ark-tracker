#!/usr/bin/env python3
"""Calculate ETF-level summary data."""

from __future__ import annotations

from common import DATA_DIR, FUNDS, read_json, utc_now, write_json


def main() -> None:
    holdings = read_json(DATA_DIR / "latest_holdings.json", [])
    trades = read_json(DATA_DIR / "daily_trades.json", [])
    summary = []
    for fund, fund_name in FUNDS.items():
        rows = [row for row in holdings if row["fund"] == fund]
        if not rows:
            continue
        top = sorted(rows, key=lambda row: row["weight"], reverse=True)[:10]
        fund_trades = [trade for trade in trades if trade["fund"] == fund]
        summary.append(
            {
                "fund": fund,
                "fundName": fund_name,
                "date": rows[0]["date"],
                "holdingsCount": len(rows),
                "totalMarketValue": sum(row["marketValue"] for row in rows),
                "topTenWeight": round(sum(row["weight"] for row in top), 4),
                "buyCount": len([trade for trade in fund_trades if trade["action"] in ("Buy", "New Position")]),
                "sellCount": len([trade for trade in fund_trades if trade["action"] in ("Sell", "Sold Out")]),
                "topHoldings": top,
                "updatedAt": utc_now(),
            }
        )
    write_json(DATA_DIR / "fund_summary.json", summary)
    print(f"Wrote {len(summary)} fund summaries")


if __name__ == "__main__":
    main()
