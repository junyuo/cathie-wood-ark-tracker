import { useEffect, useMemo, useState } from "react";
import FundSelector from "../components/FundSelector";
import HoldingsTable from "../components/HoldingsTable";
import { loadArkData } from "../data";
import type { ArkFund, Holding } from "../types/ark";

type SortKey = "weight" | "marketValue" | "shares";
type LimitKey = "10" | "25" | "All";

export default function Holdings() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [fund, setFund] = useState<ArkFund | "All">("All");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("weight");
  const [limit, setLimit] = useState<LimitKey>("25");

  useEffect(() => {
    loadArkData().then((data) => setHoldings(data.latestHoldings));
  }, []);

  const matching = useMemo(
    () => holdings
        .filter((holding) => fund === "All" || holding.fund === fund)
        .filter((holding) => `${holding.ticker} ${holding.company}`.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => b[sortKey] - a[sortKey]),
    [fund, holdings, query, sortKey],
  );
  const displayed = limit === "All" ? matching : matching.slice(0, Number(limit));
  const resultText = matching.length === holdings.length
    ? `Showing ${displayed.length} of ${holdings.length} holdings.`
    : `Showing ${displayed.length} of ${matching.length} matching holdings (${holdings.length} total).`;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Holdings</h2>
        <p className="text-sm text-muted">Search public ARK ETF holdings by ETF, ticker, or company.</p>
      </div>
      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
        <label className="text-sm font-medium text-slate-700">ETF<FundSelector id="holdings-fund" value={fund} onChange={setFund} /></label>
        <label className="text-sm font-medium text-slate-700">Ticker or company
          <input id="holdings-search" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal" placeholder="Search ticker or company" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <label className="text-sm font-medium text-slate-700">Sort
          <select id="holdings-sort" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal" value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)}>
            <option value="weight">Weight</option>
            <option value="marketValue">Market value</option>
            <option value="shares">Shares</option>
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">Rows
          <select id="holdings-limit" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal" value={limit} onChange={(event) => setLimit(event.target.value as LimitKey)}>
            <option value="10">Top 10</option>
            <option value="25">Top 25</option>
            <option value="All">All rows</option>
          </select>
        </label>
      </div>
      <p className="text-sm text-muted" aria-live="polite">{resultText}</p>
      <HoldingsTable holdings={displayed} />
    </div>
  );
}
