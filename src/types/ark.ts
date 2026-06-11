export type ArkFund = "ARKK" | "ARKW" | "ARKG" | "ARKQ" | "ARKF" | "ARKX";

export type TradeAction = "Buy" | "Sell" | "New Position" | "Sold Out" | "Unchanged";

export interface Holding {
  fund: ArkFund;
  fundName: string;
  date: string;
  company: string;
  ticker: string;
  cusip: string;
  shares: number;
  marketValue: number;
  weight: number;
  sourceUrl: string;
  updatedAt: string;
  rankInFund?: number;
  heldByFundCount?: number;
  heldByFunds?: ArkFund[];
}

export interface DailyTrade {
  date: string;
  fund: ArkFund;
  ticker: string;
  company: string;
  previousShares: number;
  currentShares: number;
  shareChange: number;
  shareChangePercent: number | null;
  previousWeight: number;
  currentWeight: number;
  weightChange: number;
  previousMarketValue: number;
  currentMarketValue: number;
  marketValueChange: number;
  action: TradeAction;
  sourceUrl: string;
}

export interface FundSummary {
  fund: ArkFund;
  fundName: string;
  date: string;
  holdingsCount: number;
  totalMarketValue: number;
  topTenWeight: number;
  buyCount: number;
  sellCount: number;
  topHoldings: Holding[];
  updatedAt: string;
}

export interface PerformancePoint {
  label: string;
  benchmark: string;
  cagr: number | null;
  cumulativeReturn: number | null;
  maximumDrawdown: number | null;
  volatility: number | null;
  sharpeRatio: number | null;
  note: string;
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

export interface ArkData {
  latestHoldings: Holding[];
  holdingsHistory: Holding[];
  dailyTrades: DailyTrade[];
  topBuys: DailyTrade[];
  topSells: DailyTrade[];
  fundSummary: FundSummary[];
  performance: PerformancePoint[];
  dataStatus: DataStatus;
}
