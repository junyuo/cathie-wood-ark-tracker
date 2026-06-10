#!/usr/bin/env python3
"""Create a no-fake-data performance placeholder for the static frontend."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

DATA_DIR = Path("public/data")
PERFORMANCE_PATH = DATA_DIR / "performance.json"


def main() -> None:
    payload = [
        {
            "date": datetime.now(timezone.utc).date().isoformat(),
            "arkk": None,
            "qqq": None,
            "spy": None,
            "note": "Placeholder until a no-key, reproducible market data source is added.",
            "sourceUrl": "",
            "updatedAt": datetime.now(timezone.utc).isoformat(),
        }
    ]
    PERFORMANCE_PATH.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"Wrote placeholder performance data to {PERFORMANCE_PATH}")


if __name__ == "__main__":
    main()
