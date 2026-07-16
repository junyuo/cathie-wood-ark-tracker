import { ArrowDownRight, ArrowUpRight, CalendarDays, Layers, Network, Table2 } from "lucide-react";
import type { DailyTrade, Holding } from "../types/ark";
import { formatNumber, formatPercent, formatSignedNumber } from "../utils/format";
import { FUNDS, latestDate, sharedTickerLeader } from "../utils/calculations";

interface Props {
  holdings: Holding[];
  topBuy?: DailyTrade;
  topSell?: DailyTrade;
  comparisonReady: boolean;
}

export default function DashboardCards({ holdings, topBuy, topSell, comparisonReady }: Props) {
  const shared = sharedTickerLeader(holdings);
  const cards = [
    { label: "Latest data date", value: latestDate(holdings), detail: "Public ARK ETF holdings", icon: CalendarDays },
    { label: "Tracked ETFs", value: formatNumber(FUNDS.length), detail: FUNDS.join(", "), icon: Layers },
    { label: "Total holdings rows", value: formatNumber(holdings.length), detail: "Latest normalized rows", icon: Table2 },
    {
      label: "Largest inferred increase",
      value: !comparisonReady ? "Baseline pending" : topBuy ? `${topBuy.fund} ${topBuy.ticker}` : "No data",
      detail: !comparisonReady
        ? "Needs two complete ETF snapshots"
        : topBuy
          ? `${formatSignedNumber(topBuy.shareChange)} shares · ${formatPercent(topBuy.shareChangePercent)}`
          : "No inferred increases",
      icon: ArrowUpRight,
    },
    {
      label: "Largest inferred decrease",
      value: !comparisonReady ? "Baseline pending" : topSell ? `${topSell.fund} ${topSell.ticker}` : "No data",
      detail: !comparisonReady
        ? "Needs two complete ETF snapshots"
        : topSell
          ? `${formatSignedNumber(topSell.shareChange)} shares · ${formatPercent(topSell.shareChangePercent)}`
          : "No inferred decreases",
      icon: ArrowDownRight,
    },
    {
      label: "Most shared ticker",
      value: shared ? shared[0] : "No data",
      detail: shared ? `Held by ${shared[1].size} ARK ETFs` : "No overlapping holdings yet",
      icon: Network,
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map(({ label, value, detail, icon: Icon }) => (
        <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-muted">{label}</p>
            <Icon className="h-5 w-5 text-brand" />
          </div>
          <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
          <p className="mt-1 text-sm text-muted">{detail}</p>
        </div>
      ))}
    </section>
  );
}
