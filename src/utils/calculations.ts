import type { ArkFund, DailyTrade, Holding } from "../types/ark";

export const FUND_NAMES: Record<ArkFund, string> = {
  ARKK: "ARK Innovation ETF",
  ARKW: "ARK Next Generation Internet ETF",
  ARKG: "ARK Genomic Revolution ETF",
  ARKQ: "ARK Autonomous Technology & Robotics ETF",
  ARKF: "ARK Fintech Innovation ETF",
  ARKX: "ARK Space Exploration & Innovation ETF",
};

export const FUNDS = Object.keys(FUND_NAMES) as ArkFund[];

export function latestDate(holdings: Holding[]) {
  return [...new Set(holdings.map((holding) => holding.date))].sort().at(-1) ?? "No data";
}

export function sharedTickerLeader(holdings: Holding[]) {
  const byTicker = new Map<string, Set<ArkFund>>();
  holdings.forEach((holding) => {
    if (!byTicker.has(holding.ticker)) byTicker.set(holding.ticker, new Set());
    byTicker.get(holding.ticker)?.add(holding.fund);
  });
  return [...byTicker.entries()].sort((a, b) => b[1].size - a[1].size)[0];
}

export function actionClass(action: DailyTrade["action"]) {
  if (action === "Buy" || action === "New Position") return "bg-emerald-50 text-buy ring-emerald-200";
  if (action === "Sell" || action === "Sold Out") return "bg-red-50 text-sell ring-red-200";
  return "bg-slate-100 text-slate-600 ring-slate-200";
}
