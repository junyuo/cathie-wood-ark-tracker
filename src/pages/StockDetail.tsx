import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import HoldingsTable from "../components/HoldingsTable";
import StockHistoryCharts from "../components/StockHistoryCharts";
import { formatCurrency, formatNumber, loadData } from "../data";
import type { Holding, Trade } from "../types/ark";

export default function StockDetail() {
  const params = useParams();
  const [query, setQuery] = useState(params.ticker ?? "TSLA");
  const [history, setHistory] = useState<Holding[]>([]);
  const [latestHoldings, setLatestHoldings] = useState<Holding[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    loadData().then((data) => {
      setHistory(data.holdingsHistory);
      setLatestHoldings(data.latestHoldings);
      setTrades(data.dailyTrades);
    });
  }, []);

  useEffect(() => {
    if (params.ticker) setQuery(params.ticker);
  }, [params.ticker]);

  const filtered = useMemo(() => {
    return history
      .filter((item) => item.ticker.toLowerCase() === query.toLowerCase())
      .sort((a, b) => b.date.localeCompare(a.date) || b.weight - a.weight);
  }, [history, query]);

  const funds = Array.from(new Set(filtered.map((item) => item.fund))).join(", ") || "No current matches";
  const normalizedTicker = query.trim().toUpperCase();
  const latestRows = useMemo(() => latestHoldings.filter((item) => item.ticker.toUpperCase() === normalizedTicker), [latestHoldings, normalizedTicker]);
  const recentTrades = useMemo(() => trades.filter((item) => item.ticker.toUpperCase() === normalizedTicker), [normalizedTicker, trades]);
  const profile = useMemo(() => {
    const ranks = latestRows.map((row) => {
      const fundRows = latestHoldings.filter((item) => item.fund === row.fund).sort((a, b) => b.weight - a.weight);
      return `${row.fund} #${fundRows.findIndex((item) => item.ticker === row.ticker) + 1}`;
    });
    return {
      fundList: latestRows.map((item) => item.fund).join(", ") || "None in latest holdings",
      totalMarketValue: latestRows.reduce((sum, item) => sum + item.marketValue, 0),
      totalShares: latestRows.reduce((sum, item) => sum + item.shares, 0),
      rankList: ranks.join(", ") || "n/a",
      recentAction: recentTrades[0] ? `${recentTrades[0].fund} ${recentTrades[0].action}` : "No latest change",
    };
  }, [latestHoldings, latestRows, recentTrades]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Stock Detail</h2>
        <p className="text-sm text-slate-600">Review one ticker across ARK ETFs. Matched funds: {funds}.</p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <label className="text-sm font-medium text-slate-700">
          Ticker
          <input className="mt-1 w-full max-w-xs rounded-md border border-slate-300 px-3 py-2" value={query} onChange={(e) => setQuery(e.target.value.toUpperCase())} />
        </label>
      </div>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Latest ETFs", profile.fundList],
          ["Total market value", formatCurrency(profile.totalMarketValue)],
          ["Total shares", formatNumber(profile.totalShares)],
          ["Weight rank", profile.rankList],
          ["Recent action", profile.recentAction],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-2 break-words text-lg font-semibold">{value}</p>
          </div>
        ))}
      </section>
      <StockHistoryCharts history={filtered} ticker={query} />
      <HoldingsTable holdings={filtered} />
    </div>
  );
}
