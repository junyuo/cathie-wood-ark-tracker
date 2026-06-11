import { useEffect, useState } from "react";
import DashboardCards from "../components/DashboardCards";
import Disclaimer from "../components/Disclaimer";
import TopHoldingsChart from "../components/TopHoldingsChart";
import TradesTable from "../components/TradesTable";
import { loadArkData } from "../data";
import type { ArkData } from "../types/ark";
import { FUNDS } from "../utils/calculations";

export default function Dashboard() {
  const [data, setData] = useState<ArkData | null>(null);

  useEffect(() => {
    loadArkData().then(setData);
  }, []);

  const holdings = data?.latestHoldings ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Dashboard</h2>
        <p className="text-sm text-muted">Public ARK ETF holdings, inferred daily changes, top holdings, and benchmark placeholders.</p>
      </div>
      <DashboardCards holdings={holdings} topBuy={data?.topBuys[0]} topSell={data?.topSells[0]} />
      <section className="grid gap-4 lg:grid-cols-2">
        {FUNDS.map((fund) => (
          <TopHoldingsChart key={fund} fund={fund} holdings={holdings} />
        ))}
      </section>
      <section className="grid gap-4 xl:grid-cols-2">
        <div>
          <h3 className="mb-3 text-lg font-semibold">Top inferred increases</h3>
          <TradesTable trades={data?.topBuys ?? []} />
        </div>
        <div>
          <h3 className="mb-3 text-lg font-semibold">Top inferred decreases</h3>
          <TradesTable trades={data?.topSells ?? []} />
        </div>
      </section>
      <Disclaimer />
    </div>
  );
}
