import type { ArkData, ArkFund, DailyTrade, DataStatus, FundSummary, Holding, PerformancePoint } from "./types/ark";

const funds: ArkFund[] = ["ARKK", "ARKW", "ARKG", "ARKQ", "ARKF", "ARKX"];

const fallbackDataStatus: DataStatus = {
  lastSuccessfulUpdate: null,
  latestHoldingDate: null,
  freshnessStatus: "unknown",
  dataAgeDays: null,
  isSampleData: true,
  funds: Object.fromEntries(
    funds.map((fund) => [fund, { status: "missing", rowCount: 0, sourceUrl: "", error: "data_status.json has not been generated yet." }]),
  ) as DataStatus["funds"],
  warnings: ["No data status file was found."],
  updatedAt: "",
};

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
  const [latestHoldings, holdingsHistory, dailyTrades, topBuys, topSells, fundSummary, performance, dataStatus] = await Promise.all([
    readJson<Holding[]>("latest_holdings.json", []),
    readJson<Holding[]>("holdings_history.json", []),
    readJson<DailyTrade[]>("daily_trades.json", []),
    readJson<DailyTrade[]>("top_buys.json", []),
    readJson<DailyTrade[]>("top_sells.json", []),
    readJson<FundSummary[]>("fund_summary.json", []),
    readJson<PerformancePoint[]>("performance.json", []),
    readJson<DataStatus>("data_status.json", fallbackDataStatus),
  ]);

  return { latestHoldings, holdingsHistory, dailyTrades, topBuys, topSells, fundSummary, performance, dataStatus };
}
