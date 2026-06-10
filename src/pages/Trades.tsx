import { useEffect, useMemo, useState } from "react";
import TradesTable from "../components/TradesTable";
import { formatCurrency, formatNumber, loadData } from "../data";
import type { DataStatus, Trade } from "../types/ark";

type MinChangeKey = "0" | "1000000" | "10000000" | "50000000";

export default function Trades() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [dataStatus, setDataStatus] = useState<DataStatus | null>(null);
  const [date, setDate] = useState("All");
  const [fund, setFund] = useState("All");
  const [ticker, setTicker] = useState("");
  const [action, setAction] = useState("All");
  const [minChange, setMinChange] = useState<MinChangeKey>("0");

  useEffect(() => {
    loadData().then((data) => {
      setTrades(data.dailyTrades);
      setDataStatus(data.dataStatus);
    });
  }, []);

  const dates = useMemo(() => ["All", ...Array.from(new Set(trades.map((item) => item.date))).sort().reverse()], [trades]);
  const filtered = useMemo(() => {
    return trades
      .filter((item) => date === "All" || item.date === date)
      .filter((item) => fund === "All" || item.fund === fund)
      .filter((item) => action === "All" || item.action === action)
      .filter((item) => item.ticker.toLowerCase().includes(ticker.toLowerCase()))
      .filter((item) => Math.abs(item.marketValueChange) >= Number(minChange))
      .sort((a, b) => Math.abs(b.marketValueChange) - Math.abs(a.marketValueChange));
  }, [action, date, fund, minChange, ticker, trades]);

  const summary = useMemo(() => {
    const buyValue = filtered.filter((item) => item.marketValueChange > 0).reduce((sum, item) => sum + item.marketValueChange, 0);
    const sellValue = filtered.filter((item) => item.marketValueChange < 0).reduce((sum, item) => sum + Math.abs(item.marketValueChange), 0);
    return {
      buyValue,
      sellValue,
      netValue: buyValue - sellValue,
      newPositions: filtered.filter((item) => item.action === "New Position").length,
      soldOut: filtered.filter((item) => item.action === "Sold Out").length,
    };
  }, [filtered]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Daily Trades</h2>
        <p className="text-sm text-slate-600">
          Buy, Sell, New Position, and Sold Out are inferred from public ETF holdings snapshot differences. They are not real-time trade confirmations and are not Cathie Wood personal account transactions.
        </p>
      </div>
      {dataStatus?.isSampleData && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 ring-1 ring-amber-200">
          Trade changes are currently derived from seed/sample holdings and should not be read as live ARK activity.
        </p>
      )}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Estimated buys", formatCurrency(summary.buyValue)],
          ["Estimated sells", formatCurrency(summary.sellValue)],
          ["Net change", formatCurrency(summary.netValue)],
          ["New positions", formatNumber(summary.newPositions)],
          ["Sold out", formatNumber(summary.soldOut)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-xl font-semibold">{value}</p>
          </div>
        ))}
      </section>
      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-5">
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
        <select className="rounded-md border border-slate-300 px-3 py-2" value={minChange} onChange={(e) => setMinChange(e.target.value as MinChangeKey)}>
          <option value="0">Any value change</option>
          <option value="1000000">At least $1M</option>
          <option value="10000000">At least $10M</option>
          <option value="50000000">At least $50M</option>
        </select>
      </div>
      <TradesTable trades={filtered} />
    </div>
  );
}
