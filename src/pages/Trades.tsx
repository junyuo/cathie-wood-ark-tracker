import { useEffect, useMemo, useState } from "react";
import FundSelector from "../components/FundSelector";
import TradesTable from "../components/TradesTable";
import { loadArkData } from "../data";
import type { ArkFund, DailyTrade, TradeAction } from "../types/ark";
import { formatNumber } from "../utils/format";

type FocusFilter = "All" | "New Position" | "Sold Out" | "Large Change";

export default function Trades() {
  const [trades, setTrades] = useState<DailyTrade[]>([]);
  const [date, setDate] = useState("All");
  const [fund, setFund] = useState<ArkFund | "All">("All");
  const [query, setQuery] = useState("");
  const [action, setAction] = useState<TradeAction | "All">("All");
  const [focus, setFocus] = useState<FocusFilter>("All");
  const [threshold, setThreshold] = useState("100000");

  useEffect(() => {
    loadArkData().then((data) => setTrades(data.dailyTrades));
  }, []);

  const dates = ["All", ...Array.from(new Set(trades.map((trade) => trade.date))).sort().reverse()];
  const filtered = useMemo(
    () =>
      trades
        .filter((trade) => date === "All" || trade.date === date)
        .filter((trade) => fund === "All" || trade.fund === fund)
        .filter((trade) => action === "All" || trade.action === action)
        .filter((trade) => focus === "All" || focus === "Large Change" || trade.action === focus)
        .filter((trade) => focus !== "Large Change" || Math.abs(trade.shareChange) >= Number(threshold))
        .filter((trade) => trade.ticker.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => Math.abs(b.shareChange) - Math.abs(a.shareChange)),
    [action, date, focus, fund, query, threshold, trades],
  );

  const summary = useMemo(
    () => ({
      buyCount: filtered.filter((trade) => trade.action === "Buy").length,
      sellCount: filtered.filter((trade) => trade.action === "Sell").length,
      newPositionCount: filtered.filter((trade) => trade.action === "New Position").length,
      soldOutCount: filtered.filter((trade) => trade.action === "Sold Out").length,
      positiveShareChange: filtered.filter((trade) => trade.shareChange > 0).reduce((sum, trade) => sum + trade.shareChange, 0),
      negativeShareChange: filtered.filter((trade) => trade.shareChange < 0).reduce((sum, trade) => sum + Math.abs(trade.shareChange), 0),
    }),
    [filtered],
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Daily Holding Changes</h2>
        <p className="text-sm text-muted">Buy and Sell labels are inferred from ARK ETF share-count changes between public holding snapshots.</p>
      </div>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {[
          ["Buy", formatNumber(summary.buyCount)],
          ["Sell", formatNumber(summary.sellCount)],
          ["New", formatNumber(summary.newPositionCount)],
          ["Sold Out", formatNumber(summary.soldOutCount)],
          ["Shares Added", formatNumber(summary.positiveShareChange)],
          ["Shares Reduced", formatNumber(summary.negativeShareChange)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-muted">{label}</p>
            <p className="mt-2 text-xl font-semibold">{value}</p>
          </div>
        ))}
      </section>
      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-6">
        <select className="rounded-md border border-slate-300 px-3 py-2" value={date} onChange={(event) => setDate(event.target.value)}>
          {dates.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <FundSelector value={fund} onChange={setFund} />
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Search ticker" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select className="rounded-md border border-slate-300 px-3 py-2" value={action} onChange={(event) => setAction(event.target.value as TradeAction | "All")}>
          {["All", "Buy", "Sell", "New Position", "Sold Out", "Unchanged"].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <select className="rounded-md border border-slate-300 px-3 py-2" value={focus} onChange={(event) => setFocus(event.target.value as FocusFilter)}>
          <option value="All">All changes</option>
          <option value="New Position">New positions</option>
          <option value="Sold Out">Sold out</option>
          <option value="Large Change">Large share change</option>
        </select>
        <input className="rounded-md border border-slate-300 px-3 py-2" value={threshold} onChange={(event) => setThreshold(event.target.value)} placeholder="Share threshold" />
      </div>
      <TradesTable trades={filtered} />
    </div>
  );
}
