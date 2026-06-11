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

  const filtered = useMemo(
    () =>
      {
        const rows = holdings
        .filter((holding) => fund === "All" || holding.fund === fund)
        .filter((holding) => `${holding.ticker} ${holding.company}`.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => b[sortKey] - a[sortKey]);
        return limit === "All" ? rows : rows.slice(0, Number(limit));
      },
    [fund, holdings, limit, query, sortKey],
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Holdings</h2>
        <p className="text-sm text-muted">Search public ARK ETF holdings by ETF, ticker, or company.</p>
      </div>
      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
        <FundSelector value={fund} onChange={setFund} />
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Search ticker or company" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select className="rounded-md border border-slate-300 px-3 py-2" value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)}>
          <option value="weight">Sort by weight</option>
          <option value="marketValue">Sort by market value</option>
          <option value="shares">Sort by shares</option>
        </select>
        <select className="rounded-md border border-slate-300 px-3 py-2" value={limit} onChange={(event) => setLimit(event.target.value as LimitKey)}>
          <option value="10">Top 10</option>
          <option value="25">Top 25</option>
          <option value="All">All rows</option>
        </select>
      </div>
      <HoldingsTable holdings={filtered} />
    </div>
  );
}
