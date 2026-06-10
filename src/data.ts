import type { Holding, PerformancePoint, Trade } from "./types/ark";

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
  const [latestHoldings, holdingsHistory, dailyTrades, topBuys, topSells, performance] = await Promise.all([
    readJson<Holding[]>("latest_holdings.json", []),
    readJson<Holding[]>("holdings_history.json", []),
    readJson<Trade[]>("daily_trades.json", []),
    readJson<Trade[]>("top_buys.json", []),
    readJson<Trade[]>("top_sells.json", []),
    readJson<PerformancePoint[]>("performance.json", []),
  ]);

  return { latestHoldings, holdingsHistory, dailyTrades, topBuys, topSells, performance };
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
