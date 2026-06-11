import { useEffect, useState } from "react";
import TopHoldingsChart from "../components/TopHoldingsChart";
import { loadArkData } from "../data";
import type { ArkData } from "../types/ark";
import { formatCurrency, formatNumber, formatPercent } from "../utils/format";

export default function Funds() {
  const [data, setData] = useState<ArkData | null>(null);

  useEffect(() => {
    loadArkData().then(setData);
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Funds</h2>
        <p className="text-sm text-muted">ETF-level summaries and Top 10 holdings concentration.</p>
      </div>
      <section className="grid gap-4 lg:grid-cols-2">
        {(data?.fundSummary ?? []).map((summary) => (
          <div key={summary.fund} className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div>
              <h3 className="text-lg font-semibold">{summary.fund}</h3>
              <p className="text-sm text-muted">{summary.fundName}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
              <p>Latest date: <span className="font-semibold">{summary.date}</span></p>
              <p>Holdings: <span className="font-semibold">{formatNumber(summary.holdingsCount)}</span></p>
              <p>Value: <span className="font-semibold">{formatCurrency(summary.totalMarketValue)}</span></p>
              <p>Top 10 weight: <span className="font-semibold">{formatPercent(summary.topTenWeight)}</span></p>
              <p>Increases: <span className="font-semibold text-buy">{formatNumber(summary.buyCount)}</span></p>
              <p>Decreases: <span className="font-semibold text-sell">{formatNumber(summary.sellCount)}</span></p>
            </div>
            {data && <TopHoldingsChart fund={summary.fund} holdings={data.latestHoldings} />}
          </div>
        ))}
      </section>
    </div>
  );
}
