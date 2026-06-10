import type { ArkFund, DataStatus, Holding, PerformancePoint, Trade } from "./types/ark";

export const FUNDS: ArkFund[] = ["ARKK", "ARKW", "ARKG", "ARKQ", "ARKF", "ARKX"];

const fallbackDataStatus: DataStatus = {
  lastSuccessfulUpdate: null,
  latestHoldingDate: null,
  freshnessStatus: "unknown",
  dataAgeDays: null,
  isSampleData: true,
  funds: {
    ARKK: { status: "missing", rowCount: 0, sourceUrl: "", error: "data_status.json has not been generated yet." },
    ARKW: { status: "missing", rowCount: 0, sourceUrl: "", error: "data_status.json has not been generated yet." },
    ARKG: { status: "missing", rowCount: 0, sourceUrl: "", error: "data_status.json has not been generated yet." },
    ARKQ: { status: "missing", rowCount: 0, sourceUrl: "", error: "data_status.json has not been generated yet." },
    ARKF: { status: "missing", rowCount: 0, sourceUrl: "", error: "data_status.json has not been generated yet." },
    ARKX: { status: "missing", rowCount: 0, sourceUrl: "", error: "data_status.json has not been generated yet." },
  },
  warnings: ["No data status file was found."],
  updatedAt: "",
};

async function readJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}data/${path}`);
    if (!response.ok) return fallback;
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

export async function loadData() {
  const [latestHoldings, holdingsHistory, dailyTrades, topBuys, topSells, performance, dataStatus] = await Promise.all([
    readJson<Holding[]>("latest_holdings.json", []),
    readJson<Holding[]>("holdings_history.json", []),
    readJson<Trade[]>("daily_trades.json", []),
    readJson<Trade[]>("top_buys.json", []),
    readJson<Trade[]>("top_sells.json", []),
    readJson<PerformancePoint[]>("performance.json", []),
    readJson<DataStatus>("data_status.json", fallbackDataStatus),
  ]);

  return { latestHoldings, holdingsHistory, dailyTrades, topBuys, topSells, performance, dataStatus };
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

export function formatPercent(value: number | null) {
  if (value === null || Number.isNaN(value)) return "n/a";
  return `${value.toFixed(2)}%`;
}
