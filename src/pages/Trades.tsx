import { useEffect, useMemo, useState } from "react";
import Disclaimer from "../components/Disclaimer";
import FundSelector from "../components/FundSelector";
import TradesTable from "../components/TradesTable";
import { loadArkData } from "../data";
import type { ArkData, ArkFund, TradeAction } from "../types/ark";
import { completeSnapshotDates, hasCompleteComparisonBaseline } from "../utils/calculations";
import { formatNumber } from "../utils/format";

type FocusFilter = "All" | "New Position" | "Sold Out" | "Large Change";

export default function Trades() {
  const [data, setData] = useState<ArkData | null>(null);
  const [date, setDate] = useState("All");
  const [fund, setFund] = useState<ArkFund | "All">("All");
  const [query, setQuery] = useState("");
  const [action, setAction] = useState<TradeAction | "All">("All");
  const [focus, setFocus] = useState<FocusFilter>("All");
  const [threshold, setThreshold] = useState("100000");

  useEffect(() => {
    loadArkData().then(setData);
  }, []);

  const trades = data?.dailyTrades ?? [];
  const completeDates = completeSnapshotDates(data?.holdingsHistory ?? []);
  const comparisonReady = hasCompleteComparisonBaseline(data?.holdingsHistory ?? []);
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

  if (!data) {
    return <p className="text-sm text-muted">Loading holding changes…</p>;
  }

  if (!comparisonReady) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-semibold">Daily Holding Changes</h2>
          <p className="text-sm text-muted">Buy and Sell labels are inferred from ARK ETF share-count changes between public holding snapshots.</p>
        </div>
        <Disclaimer />
        <section className="rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
          <h3 className="font-semibold">Establishing comparison baseline</h3>
          <p className="mt-1">
            {completeDates.length} of 2 complete ETF snapshot dates are available. Holding-change rankings and filters will appear after the next distinct date containing all six ETFs.
          </p>
        </section>
      </div>
    );
  }

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
      <Disclaimer />
      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-6">
        <label className="text-sm font-medium text-slate-700">Date
          <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal" value={date} onChange={(event) => setDate(event.target.value)}>
            {dates.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">ETF<FundSelector id="trades-fund" value={fund} onChange={setFund} /></label>
        <label className="text-sm font-medium text-slate-700">Ticker
          <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal" placeholder="Search ticker" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <label className="text-sm font-medium text-slate-700">Action
          <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal" value={action} onChange={(event) => setAction(event.target.value as TradeAction | "All")}>
            {["All", "Buy", "Sell", "New Position", "Sold Out", "Unchanged"].map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">Focus
          <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal" value={focus} onChange={(event) => setFocus(event.target.value as FocusFilter)}>
            <option value="All">All changes</option>
            <option value="New Position">New positions</option>
            <option value="Sold Out">Sold out</option>
            <option value="Large Change">Large share change</option>
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">Share threshold
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal disabled:bg-slate-100 disabled:text-slate-400"
            value={threshold}
            onChange={(event) => setThreshold(event.target.value)}
            placeholder="100000"
            inputMode="numeric"
            disabled={focus !== "Large Change"}
          />
        </label>
      </div>
      <p className="text-sm text-muted" aria-live="polite">Showing {filtered.length} of {trades.length} inferred holding changes.</p>
      <TradesTable trades={filtered} />
    </div>
  );
}
