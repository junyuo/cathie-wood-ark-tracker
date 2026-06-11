import type { ArkData, DailyTrade, FundSummary, Holding, PerformancePoint } from "./types/ark";

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}data/${file}`);
    if (!response.ok) return fallback;
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

export async function loadArkData(): Promise<ArkData> {
  const [latestHoldings, holdingsHistory, dailyTrades, topBuys, topSells, fundSummary, performance] = await Promise.all([
    readJson<Holding[]>("latest_holdings.json", []),
    readJson<Holding[]>("holdings_history.json", []),
    readJson<DailyTrade[]>("daily_trades.json", []),
    readJson<DailyTrade[]>("top_buys.json", []),
    readJson<DailyTrade[]>("top_sells.json", []),
    readJson<FundSummary[]>("fund_summary.json", []),
    readJson<PerformancePoint[]>("performance.json", []),
  ]);

  return { latestHoldings, holdingsHistory, dailyTrades, topBuys, topSells, fundSummary, performance };
}
