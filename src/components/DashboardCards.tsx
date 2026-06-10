import { ArrowDownRight, ArrowUpRight, CalendarDays, Layers } from "lucide-react";
import { formatNumber } from "../data";
import type { Holding, Trade } from "../types/ark";

interface Props {
  holdings: Holding[];
  topBuy?: Trade;
  topSell?: Trade;
}

export default function DashboardCards({ holdings, topBuy, topSell }: Props) {
  const latestDate = holdings[0]?.date ?? "No data";
  const fundCount = new Set(holdings.map((item) => item.fund)).size;

  const cards = [
    { label: "Latest data date", value: latestDate, detail: "From ARK public ETF holdings", icon: CalendarDays },
    { label: "Tracked ETFs", value: fundCount.toString(), detail: "ARKK, ARKW, ARKG, ARKQ, ARKF, ARKX", icon: Layers },
    {
      label: "Largest buy",
      value: topBuy ? `${topBuy.fund} ${topBuy.ticker}` : "No data",
      detail: topBuy ? `${formatNumber(topBuy.sharesChange)} shares` : "Waiting for two snapshots",
      icon: ArrowUpRight,
    },
    {
      label: "Largest sell",
      value: topSell ? `${topSell.fund} ${topSell.ticker}` : "No data",
      detail: topSell ? `${formatNumber(Math.abs(topSell.sharesChange))} shares` : "Waiting for two snapshots",
      icon: ArrowDownRight,
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ label, value, detail, icon: Icon }) => (
        <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <Icon className="h-5 w-5 text-moss" />
          </div>
          <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
          <p className="mt-1 text-sm text-slate-500">{detail}</p>
        </div>
      ))}
    </section>
  );
}
