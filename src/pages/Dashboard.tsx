import { useEffect, useMemo, useState } from "react";
import DataStatusPanel from "../components/DataStatusPanel";
import DashboardCards from "../components/DashboardCards";
import TopHoldingsChart from "../components/TopHoldingsChart";
import { loadData } from "../data";
import type { DataBundle } from "../types/ark";

const funds = ["ARKK", "ARKW", "ARKG", "ARKQ", "ARKF", "ARKX"] as const;

export default function Dashboard() {
  const [data, setData] = useState<DataBundle | null>(null);

  useEffect(() => {
    loadData().then(setData);
  }, []);

  const holdings = data?.latestHoldings ?? [];
  const topBuy = data?.topBuys[0];
  const topSell = data?.topSells[0];
  const updatedAt = useMemo(() => holdings[0]?.updatedAt ?? data?.dailyTrades[0]?.updatedAt, [data, holdings]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">Dashboard</h2>
        <p className="text-sm text-slate-600">
          Daily public holdings tracker for ARK Invest ETFs. Last updated: {updatedAt ?? "No data yet"}.
        </p>
      </div>
      {data && <DataStatusPanel status={data.dataStatus} />}
      <DashboardCards holdings={holdings} topBuy={topBuy} topSell={topSell} />
      <section className="grid gap-4 lg:grid-cols-2">
        {funds.map((fund) => (
          <TopHoldingsChart key={fund} holdings={holdings} fund={fund} />
        ))}
      </section>
    </div>
  );
}
