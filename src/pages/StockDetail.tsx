import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import HoldingsTable from "../components/HoldingsTable";
import { loadData } from "../data";
import type { Holding } from "../types/ark";

export default function StockDetail() {
  const params = useParams();
  const [query, setQuery] = useState(params.ticker ?? "TSLA");
  const [history, setHistory] = useState<Holding[]>([]);

  useEffect(() => {
    loadData().then((data) => setHistory(data.holdingsHistory));
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
      <HoldingsTable holdings={filtered} />
    </div>
  );
}
