import { useEffect, useMemo, useState } from "react";
import HoldingsTable from "../components/HoldingsTable";
import { formatCurrency, formatNumber, loadData } from "../data";
import type { DataStatus, Holding } from "../types/ark";

type SortKey = "weight" | "marketValue";
type LimitKey = "10" | "25" | "All";

export default function Holdings() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [dataStatus, setDataStatus] = useState<DataStatus | null>(null);
  const [fund, setFund] = useState("All");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("weight");
  const [limit, setLimit] = useState<LimitKey>("25");

  useEffect(() => {
    loadData().then((data) => {
      setHoldings(data.latestHoldings);
      setDataStatus(data.dataStatus);
    });
  }, []);

  const filtered = useMemo(() => {
    const rows = holdings
      .filter((item) => fund === "All" || item.fund === fund)
      .filter((item) => `${item.ticker} ${item.company}`.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => b[sortKey] - a[sortKey]);
    if (limit === "All") return rows;
    return rows.slice(0, Number(limit));
  }, [fund, holdings, limit, query, sortKey]);

  const scopedRows = useMemo(() => holdings.filter((item) => fund === "All" || item.fund === fund), [fund, holdings]);
  const summary = useMemo(() => {
    const tickerFunds = new Map<string, Set<string>>();
    for (const item of scopedRows) {
      if (!tickerFunds.has(item.ticker)) tickerFunds.set(item.ticker, new Set());
      tickerFunds.get(item.ticker)?.add(item.fund);
    }
    return {
      count: scopedRows.length,
      totalMarketValue: scopedRows.reduce((sum, item) => sum + item.marketValue, 0),
      weightTotal: scopedRows.reduce((sum, item) => sum + item.weight, 0),
      multiFundTickers: Array.from(tickerFunds.values()).filter((funds) => funds.size > 1).length,
    };
  }, [scopedRows]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Holdings</h2>
        <p className="text-sm text-slate-600">Filter ARK ETF holdings by fund and ticker.</p>
      </div>
      {dataStatus?.isSampleData && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 ring-1 ring-amber-200">
          Holdings are currently seed/sample data. Use them to inspect the interface, not as live ARK holdings.
        </p>
      )}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Rows", formatNumber(summary.count)],
          ["Market value", formatCurrency(summary.totalMarketValue)],
          ["Weight total", `${summary.weightTotal.toFixed(2)}%`],
          ["Multi-ETF tickers", formatNumber(summary.multiFundTickers)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-xl font-semibold">{value}</p>
          </div>
        ))}
      </section>
      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm font-medium text-slate-700">
          ETF
          <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={fund} onChange={(e) => setFund(e.target.value)}>
            {["All", "ARKK", "ARKW", "ARKG", "ARKQ", "ARKF", "ARKX"].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Search
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            placeholder="Ticker or company"
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
        <label className="text-sm font-medium text-slate-700">
          Show
          <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={limit} onChange={(e) => setLimit(e.target.value as LimitKey)}>
            <option value="10">Top 10</option>
            <option value="25">Top 25</option>
            <option value="All">All</option>
          </select>
        </label>
      </div>
      <HoldingsTable holdings={filtered} />
    </div>
  );
}
