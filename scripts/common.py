from __future__ import annotations

import json
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
