import { useEffect, useMemo, useState } from "react";
import FundSelector from "../components/FundSelector";
import TradesTable from "../components/TradesTable";
import { loadArkData } from "../data";
import type { ArkFund, DailyTrade, TradeAction } from "../types/ark";

export default function Trades() {
  const [trades, setTrades] = useState<DailyTrade[]>([]);
  const [date, setDate] = useState("All");
  const [fund, setFund] = useState<ArkFund | "All">("All");
  const [query, setQuery] = useState("");
  const [action, setAction] = useState<TradeAction | "All">("All");

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
        .filter((trade) => trade.ticker.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => Math.abs(b.shareChange) - Math.abs(a.shareChange)),
    [action, date, fund, query, trades],
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Daily Holding Changes</h2>
        <p className="text-sm text-muted">Buy and Sell labels are inferred from ARK ETF share-count changes between public holding snapshots.</p>
      </div>
      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
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
      </div>
      <TradesTable trades={filtered} />
    </div>
  );
}
