#!/usr/bin/env python3
"""Write explicit performance placeholders without fake metrics."""

from __future__ import annotations

from common import DATA_DIR, utc_now, write_json


def main() -> None:
    rows = [
        ("ARKK vs QQQ vs SPY", "QQQ, SPY"),
        ("ARKW vs QQQ", "QQQ"),
        ("ARKG vs XLV or IBB", "XLV, IBB"),
        ("ARKF vs FINX or QQQ", "FINX, QQQ"),
    ]
    write_json(
        DATA_DIR / "performance.json",
        [
            {
                "label": label,
                "benchmark": benchmark,
                "cagr": None,
                "cumulativeReturn": None,
                "maximumDrawdown": None,
                "volatility": None,
                "sharpeRatio": None,
                "note": "Performance data not available yet. No fake price metrics are generated.",
                "updatedAt": utc_now(),
            }
            for label, benchmark in rows
        ],
    )
    print("Wrote performance placeholders")


if __name__ == "__main__":
    main()
