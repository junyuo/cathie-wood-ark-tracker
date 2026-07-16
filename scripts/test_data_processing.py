#!/usr/bin/env python3
"""Basic no-network checks for data parsing and action inference."""

from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path

import fetch_ark_holdings
from common import FUNDS, build_fund_status, parse_number
from compare_daily_trades import infer_action
from fetch_ark_holdings import fetch_fund, static_candidate_urls


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "public/data"


def fixture_row(fund: str, ticker: str, shares: str, weight: str = "4.25%") -> dict:
    return {
        "_fund": fund,
        "_sourceUrl": f"https://official.example/{fund}.csv",
        "_updatedAt": "2026-06-11T00:00:00Z",
        "date": "2026-06-11",
        "company": f"{ticker} COMPANY",
        "ticker": ticker,
        "cusip": "123456789",
        "shares": shares,
        "market value ($)": "$12,345.67",
        "weight (%)": weight,
    }


def run_normalize_fixture(rows: list[dict]) -> tuple[int, str]:
    (DATA_DIR / "raw_holdings.json").write_text(json.dumps({"rows": rows, "errors": {}}, indent=2), encoding="utf-8")
    result = subprocess.run(["python3", "scripts/normalize_holdings.py"], cwd=ROOT, text=True, capture_output=True)
    return result.returncode, result.stdout + result.stderr


def test_official_holdings_urls_and_parsing() -> None:
    csv_text = (
        "date,fund,company,ticker,cusip,shares,market value ($),weight (%)\n"
        "07/15/2026,Example Fund,Example Company,TEST,123456789,1000,$10000.00,1.25%\n"
    )
    original_get = fetch_ark_holdings.requests.get

    class FakeResponse:
        status_code = 200
        headers = {"content-type": "application/octet-stream"}
        text = csv_text
        ok = True

        @staticmethod
        def raise_for_status() -> None:
            return None

    try:
        for fund in FUNDS:
            requested_urls: list[str] = []

            def fake_get(url: str, **_: object) -> FakeResponse:
                requested_urls.append(url)
                return FakeResponse()

            fetch_ark_holdings.requests.get = fake_get
            diagnostics: list[dict] = []
            rows, error = fetch_fund(fund, diagnostics)

            assert error == ""
            assert len(rows) == 1
            assert rows[0]["_fund"] == fund
            assert requested_urls == [static_candidate_urls(fund)[0]]
            assert diagnostics[0]["rowCount"] == 1
            assert diagnostics[0]["url"].startswith(fetch_ark_holdings.ASSET_BASE_URL)
    finally:
        fetch_ark_holdings.requests.get = original_get


def test_normalize_complete_fixture() -> None:
    backup = ROOT / ".tmp-test-data-backup"
    if backup.exists():
        shutil.rmtree(backup)
    shutil.copytree(DATA_DIR, backup)
    try:
        (DATA_DIR / "holdings_history.json").unlink(missing_ok=True)
        rows = [
            fixture_row("ARKK", "AAA", "1,234"),
            fixture_row("ARKW", "BBB", "N/A"),
            fixture_row("ARKG", "CCC", ""),
            fixture_row("ARKQ", "DDD", "2,000"),
            fixture_row("ARKF", "EEE", "3,000"),
            fixture_row("ARKX", "FFF", "4,000"),
        ]
        code, output = run_normalize_fixture(rows)
        assert code == 0, output
        latest = json.loads((DATA_DIR / "latest_holdings.json").read_text(encoding="utf-8"))
        history = json.loads((DATA_DIR / "holdings_history.json").read_text(encoding="utf-8"))
        status = json.loads((DATA_DIR / "data_status.json").read_text(encoding="utf-8"))
        assert len(latest) == 6
        assert len(history) == 6
        assert latest[0]["rankInFund"] == 1
        assert latest[0]["heldByFunds"] == ["ARKK"]
        assert latest[0]["shares"] == 1234
        assert latest[1]["shares"] == 0
        assert status["isSampleData"] is False

        code, output = run_normalize_fixture(rows)
        assert code == 0, output
        history_again = json.loads((DATA_DIR / "holdings_history.json").read_text(encoding="utf-8"))
        assert len(history_again) == 6, "same-date history should be deduped"
    finally:
        shutil.rmtree(DATA_DIR)
        shutil.copytree(backup, DATA_DIR)
        shutil.rmtree(backup)


def test_normalize_missing_fund_preserves_data() -> None:
    backup = ROOT / ".tmp-test-data-backup"
    if backup.exists():
        shutil.rmtree(backup)
    shutil.copytree(DATA_DIR, backup)
    try:
        before = (DATA_DIR / "latest_holdings.json").read_text(encoding="utf-8")
        rows = [
            fixture_row("ARKK", "AAA", "1,000"),
            fixture_row("ARKW", "BBB", "1,000"),
            fixture_row("ARKG", "CCC", "1,000"),
            fixture_row("ARKQ", "DDD", "1,000"),
            fixture_row("ARKF", "EEE", "1,000"),
        ]
        code, output = run_normalize_fixture(rows)
        assert code != 0
        assert "missing holdings for required funds: ARKX" in output
        after = (DATA_DIR / "latest_holdings.json").read_text(encoding="utf-8")
        status = json.loads((DATA_DIR / "data_status.json").read_text(encoding="utf-8"))
        assert before == after
        assert any("Candidate holdings failed validation" in warning for warning in status["warnings"])
    finally:
        shutil.rmtree(DATA_DIR)
        shutil.copytree(backup, DATA_DIR)
        shutil.rmtree(backup)


def test_compare_outputs_market_value_changes() -> None:
    backup = ROOT / ".tmp-test-data-backup"
    if backup.exists():
        shutil.rmtree(backup)
    shutil.copytree(DATA_DIR, backup)
    try:
        history = [
            {
                "fund": "ARKK",
                "date": "2026-06-10",
                "company": "AAA COMPANY",
                "ticker": "AAA",
                "shares": 100,
                "marketValue": 1000,
                "weight": 1.0,
                "sourceUrl": "https://official.example/ARKK.csv",
            },
            {
                "fund": "ARKK",
                "date": "2026-06-11",
                "company": "AAA COMPANY",
                "ticker": "AAA",
                "shares": 150,
                "marketValue": 1800,
                "weight": 1.5,
                "sourceUrl": "https://official.example/ARKK.csv",
            },
        ]
        (DATA_DIR / "holdings_history.json").write_text(json.dumps(history, indent=2), encoding="utf-8")
        result = subprocess.run(["python3", "scripts/compare_daily_trades.py"], cwd=ROOT, text=True, capture_output=True)
        assert result.returncode == 0, result.stdout + result.stderr
        trades = json.loads((DATA_DIR / "daily_trades.json").read_text(encoding="utf-8"))
        assert trades[0]["previousMarketValue"] == 1000
        assert trades[0]["currentMarketValue"] == 1800
        assert trades[0]["marketValueChange"] == 800
        assert trades[0]["action"] == "Buy"
    finally:
        shutil.rmtree(DATA_DIR)
        shutil.copytree(backup, DATA_DIR)
        shutil.rmtree(backup)


def main() -> None:
    assert parse_number("1,234") == 1234
    assert parse_number("$1,234.56") == 1234.56
    assert parse_number("4.25%") == 4.25
    assert parse_number("N/A") == 0
    assert parse_number("") == 0
    assert parse_number("(12.5)") == -12.5

    sample_status = build_fund_status([{"fund": "ARKK", "sourceUrl": "sample"}], is_sample_data=True)
    assert sample_status["ARKK"]["status"] == "sample"
    assert sample_status["ARKW"]["status"] == "missing"

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

    test_official_holdings_urls_and_parsing()
    test_normalize_complete_fixture()
    test_normalize_missing_fund_preserves_data()
    test_compare_outputs_market_value_changes()
    print("Data processing checks passed")


if __name__ == "__main__":
    main()
