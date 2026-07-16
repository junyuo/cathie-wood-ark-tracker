import type { DataStatus } from "../types/ark";
import { FUNDS } from "./calculations.ts";

export function hasDataIssue(status: DataStatus) {
  return status.isSampleData
    || status.warnings.length > 0
    || status.freshnessStatus !== "fresh"
    || FUNDS.some((fund) => status.funds[fund]?.status !== "success");
}

export function successfulFundCount(status: DataStatus) {
  return FUNDS.filter((fund) => status.funds[fund]?.status === "success").length;
}
