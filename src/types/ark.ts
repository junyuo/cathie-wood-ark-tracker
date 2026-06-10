export type ArkFund = "ARKK" | "ARKW" | "ARKG" | "ARKQ" | "ARKF" | "ARKX";

export type TradeAction = "Buy" | "Sell" | "New Position" | "Sold Out" | "Unchanged";

export interface Holding {
  fund: ArkFund;
  date: string;
  company: string;
  ticker: string;
  cusip: string;
  shares: number;
  marketValue: number;
  weight: number;
  sourceUrl: string;
  updatedAt: string;
}

export interface Trade {
  fund: ArkFund;
  date: string;
  company: string;
  ticker: string;
  action: TradeAction;
  previousShares: number;
  currentShares: number;
  sharesChange: number;
  percentChange: number | null;
  previousMarketValue: number;
  currentMarketValue: number;
  marketValueChange: number;
  marketValue: number;
  weight: number;
  sourceUrl: string;
  updatedAt: string;
}

export interface PerformancePoint {
  date: string;
  arkk: number | null;
  qqq: number | null;
  spy: number | null;
  note?: string;
  sourceUrl?: string;
  updatedAt: string;
}

export interface FundDataStatus {
  status: "success" | "failed" | "missing";
  rowCount: number;
  sourceUrl: string;
  error: string;
}

export interface DataStatus {
  lastSuccessfulUpdate: string | null;
  latestHoldingDate: string | null;
  freshnessStatus: "fresh" | "stale" | "old" | "unknown";
  dataAgeDays: number | null;
  isSampleData: boolean;
  funds: Record<ArkFund, FundDataStatus>;
  warnings: string[];
  updatedAt: string;
}

export interface DataBundle {
  latestHoldings: Holding[];
  holdingsHistory: Holding[];
  dailyTrades: Trade[];
  topBuys: Trade[];
  topSells: Trade[];
  performance: PerformancePoint[];
  dataStatus: DataStatus;
}
