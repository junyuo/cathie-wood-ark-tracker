#!/usr/bin/env python3
"""Basic no-network checks for data parsing and action inference."""

from __future__ import annotations

from common import parse_number
from compare_daily_trades import infer_action


def main() -> None:
    assert parse_number("1,234") == 1234
    assert parse_number("$1,234.56") == 1234.56
    assert parse_number("4.25%") == 4.25
    assert parse_number("N/A") == 0
    assert parse_number("") == 0
    assert parse_number("(12.5)") == -12.5

    previous = {"shares": 100, "marketValue": 1000, "weight": 1.0}
    current = {"shares": 150, "marketValue": 1500, "weight": 1.2}
    assert infer_action(previous, current, 50, 500, 0.2) == "Buy"
    assert infer_action(previous, current, -50, -500, -0.2) == "Sell"
    assert infer_action(None, current, 150, 1500, 1.2) == "New Position"
    assert infer_action(previous, None, -100, -1000, -1.0) == "Sold Out"
    assert infer_action(previous, current, 0, 500, 0.2) == "Unchanged"

    missing_shares_previous = {"shares": 0, "marketValue": 1000, "weight": 1.0}
    missing_shares_current = {"shares": 0, "marketValue": 1200, "weight": 1.1}
    assert infer_action(missing_shares_previous, missing_shares_current, 0, 200, 0.1) == "Buy"

    print("Data processing checks passed")


if __name__ == "__main__":
    main()
