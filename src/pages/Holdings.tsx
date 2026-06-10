import { useEffect, useMemo, useState } from "react";
import HoldingsTable from "../components/HoldingsTable";
import { loadData } from "../data";
import type { Holding } from "../types/ark";

type SortKey = "weight" | "marketValue";

export default function Holdings() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [fund, setFund] = useState("All");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("weight");

  useEffect(() => {
    loadData().then((data) => setHoldings(data.latestHoldings));
  }, []);

  const filtered = useMemo(() => {
    return holdings
      .filter((item) => fund === "All" || item.fund === fund)
      .filter((item) => item.ticker.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => b[sortKey] - a[sortKey]);
  }, [fund, holdings, query, sortKey]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Holdings</h2>
        <p className="text-sm text-slate-600">Filter ARK ETF holdings by fund and ticker.</p>
      </div>
      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-3">
        <label className="text-sm font-medium text-slate-700">
          ETF
          <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={fund} onChange={(e) => setFund(e.target.value)}>
            {["All", "ARKK", "ARKW", "ARKG", "ARKQ", "ARKF", "ARKX"].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Ticker
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            placeholder="Search ticker"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Sort by
          <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
            <option value="weight">Weight</option>
            <option value="marketValue">Market Value</option>
          </select>
        </label>
      </div>
      <HoldingsTable holdings={filtered} />
    </div>
  );
}
