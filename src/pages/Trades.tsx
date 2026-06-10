import { useEffect, useMemo, useState } from "react";
import TradesTable from "../components/TradesTable";
import { loadData } from "../data";
import type { Trade } from "../types/ark";

export default function Trades() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [date, setDate] = useState("All");
  const [fund, setFund] = useState("All");
  const [ticker, setTicker] = useState("");
  const [action, setAction] = useState("All");

  useEffect(() => {
    loadData().then((data) => setTrades(data.dailyTrades));
  }, []);

  const dates = useMemo(() => ["All", ...Array.from(new Set(trades.map((item) => item.date))).sort().reverse()], [trades]);
  const filtered = useMemo(() => {
    return trades
      .filter((item) => date === "All" || item.date === date)
      .filter((item) => fund === "All" || item.fund === fund)
      .filter((item) => action === "All" || item.action === action)
      .filter((item) => item.ticker.toLowerCase().includes(ticker.toLowerCase()))
      .sort((a, b) => Math.abs(b.sharesChange) - Math.abs(a.sharesChange));
  }, [action, date, fund, ticker, trades]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Daily Trades</h2>
        <p className="text-sm text-slate-600">Changes are calculated from the latest two holding snapshots.</p>
      </div>
      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <select className="rounded-md border border-slate-300 px-3 py-2" value={date} onChange={(e) => setDate(e.target.value)}>
          {dates.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <select className="rounded-md border border-slate-300 px-3 py-2" value={fund} onChange={(e) => setFund(e.target.value)}>
          {["All", "ARKK", "ARKW", "ARKG", "ARKQ", "ARKF", "ARKX"].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Ticker" value={ticker} onChange={(e) => setTicker(e.target.value)} />
        <select className="rounded-md border border-slate-300 px-3 py-2" value={action} onChange={(e) => setAction(e.target.value)}>
          {["All", "Buy", "Sell", "New Position", "Sold Out", "Unchanged"].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </div>
      <TradesTable trades={filtered} />
    </div>
  );
}
