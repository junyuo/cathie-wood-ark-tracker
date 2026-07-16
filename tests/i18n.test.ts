import assert from "node:assert/strict";
import test from "node:test";
import { detectLocale, resolveLocale, translate } from "../src/i18n/locale.ts";
import { en, zhTW } from "../src/i18n/messages.ts";
import { hasDataIssue, successfulFundCount } from "../src/utils/dataQuality.ts";
import type { DataStatus } from "../src/types/ark.ts";

function healthyStatus(): DataStatus {
  const funds = Object.fromEntries(["ARKK", "ARKW", "ARKG", "ARKQ", "ARKF", "ARKX"].map((fund) => [fund, {
    status: "success",
    rowCount: 1,
    sourceUrl: "https://example.com/source.csv",
    error: null,
  }])) as DataStatus["funds"];
  return {
    lastSuccessfulUpdate: "2026-07-16T01:00:00Z",
    latestHoldingDate: "2026-07-15",
    freshnessStatus: "fresh",
    dataAgeDays: 1,
    isSampleData: false,
    funds,
    warnings: [],
    updatedAt: "2026-07-16T01:00:00Z",
  };
}

test("detects supported Traditional Chinese browser locales", () => {
  for (const language of ["zh-TW", "zh-Hant", "zh-HK", "zh-MO", "zh-Hant-TW"]) {
    assert.equal(detectLocale([language]), "zh-TW");
  }
});

test("falls back to English for all other browser locales", () => {
  assert.equal(detectLocale(["zh-CN", "zh-Hans", "ja-JP", "en-GB"]), "en");
});

test("uses valid stored locale and ignores invalid stored values", () => {
  assert.equal(resolveLocale("en", ["zh-TW"]), "en");
  assert.equal(resolveLocale("zh-TW", ["en-US"]), "zh-TW");
  assert.equal(resolveLocale("invalid", ["zh-HK"]), "zh-TW");
  assert.equal(resolveLocale(null, ["en-US"]), "en");
});

test("translates parameterized messages without changing stable data values", () => {
  assert.equal(translate("zh-TW", "action.Buy"), "增持");
  assert.equal(translate("zh-TW", "quality.etfCount", { success: 6, total: 6 }), "6/6 檔 ETF");
  assert.equal(translate("en", "dashboard.baselineProgress", { count: 1 }).startsWith("1 of 2"), true);
});

test("keeps English and Traditional Chinese translation keys complete", () => {
  assert.deepEqual(Object.keys(zhTW).sort(), Object.keys(en).sort());
});

test("expands data quality details for stale, failed, and unknown states", () => {
  const healthy = healthyStatus();
  assert.equal(hasDataIssue(healthy), false);
  assert.equal(successfulFundCount(healthy), 6);

  assert.equal(hasDataIssue({ ...healthy, freshnessStatus: "stale" }), true);
  assert.equal(hasDataIssue({ ...healthy, freshnessStatus: "unknown", dataAgeDays: null }), true);

  const failed = healthyStatus();
  failed.funds.ARKK = { ...failed.funds.ARKK!, status: "failed", error: "HTTP 500" };
  assert.equal(hasDataIssue(failed), true);
  assert.equal(successfulFundCount(failed), 5);
});
