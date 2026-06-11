import { useEffect, useMemo, useState } from "react";
import FundSelector from "../components/FundSelector";
import HoldingsTable from "../components/HoldingsTable";
import { loadArkData } from "../data";
import type { ArkFund, Holding } from "../types/ark";

type SortKey = "weight" | "marketValue" | "shares";

export default function Holdings() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [fund, setFund] = useState<ArkFund | "All">("All");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("weight");

  useEffect(() => {
    loadArkData().then((data) => setHoldings(data.latestHoldings));
  }, []);

  const filtered = useMemo(
    () =>
      holdings
        .filter((holding) => fund === "All" || holding.fund === fund)
        .filter((holding) => `${holding.ticker} ${holding.company}`.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => b[sortKey] - a[sortKey]),
    [fund, holdings, query, sortKey],
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Holdings</h2>
        <p className="text-sm text-muted">Search public ARK ETF holdings by ETF, ticker, or company.</p>
      </div>
      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3">
        <FundSelector value={fund} onChange={setFund} />
        <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Search ticker or company" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select className="rounded-md border border-slate-300 px-3 py-2" value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)}>
          <option value="weight">Sort by weight</option>
          <option value="marketValue">Sort by market value</option>
          <option value="shares">Sort by shares</option>
        </select>
      </div>
      <HoldingsTable holdings={filtered} />
    </div>
  );
}
