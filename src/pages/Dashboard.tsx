import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DataQuality from "../components/DataQuality";
import DashboardCards from "../components/DashboardCards";
import Disclaimer from "../components/Disclaimer";
import TopHoldingsChart from "../components/TopHoldingsChart";
import TradesTable from "../components/TradesTable";
import { loadArkData } from "../data";
import type { ArkData, ArkFund } from "../types/ark";
import { completeSnapshotDates, FUNDS, hasCompleteComparisonBaseline } from "../utils/calculations";

export default function Dashboard() {
  const [data, setData] = useState<ArkData | null>(null);
  const [selectedFund, setSelectedFund] = useState<ArkFund>("ARKK");

  useEffect(() => {
    loadArkData().then(setData);
  }, []);

  const holdings = data?.latestHoldings ?? [];
  const history = data?.holdingsHistory ?? [];
  const completeDates = completeSnapshotDates(history);
  const comparisonReady = hasCompleteComparisonBaseline(history);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Dashboard</h2>
        <p className="text-sm text-muted">Public ARK ETF holdings, data quality, concentration, and validated snapshot changes.</p>
      </div>
      {data && <DataQuality status={data.dataStatus} />}
      <DashboardCards
        holdings={holdings}
        topBuy={comparisonReady ? data?.topBuys[0] : undefined}
        topSell={comparisonReady ? data?.topSells[0] : undefined}
        comparisonReady={comparisonReady}
      />
      <section>
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold">Top 10 holdings</h3>
            <p className="text-sm text-muted">Switch ETFs to compare concentration without repeating six charts.</p>
          </div>
          <label className="text-sm font-medium text-slate-700">
            ETF
            <select
              className="ml-2 rounded-md border border-slate-300 bg-white px-3 py-2"
              value={selectedFund}
              onChange={(event) => setSelectedFund(event.target.value as ArkFund)}
            >
              {FUNDS.map((fund) => <option key={fund}>{fund}</option>)}
            </select>
          </label>
        </div>
        <TopHoldingsChart fund={selectedFund} holdings={holdings} />
      </section>
      <section className="space-y-4" aria-labelledby="inferred-changes-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 id="inferred-changes-heading" className="text-lg font-semibold">Inferred holding changes</h3>
            <p className="text-sm text-muted">Changes are shown only when two complete six-ETF snapshots are available.</p>
          </div>
          <Link className="text-sm font-semibold text-brand hover:underline" to="/trades">View all trades</Link>
        </div>
        <Disclaimer />
        {!comparisonReady ? (
          <div className="rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
            <p className="font-semibold">Establishing comparison baseline</p>
            <p className="mt-1">
              {completeDates.length} of 2 complete ETF snapshot dates are available. Rankings will appear after the next distinct date containing all six ETFs.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            <div>
              <h4 className="mb-3 font-semibold">Top inferred increases</h4>
              <TradesTable trades={(data?.topBuys ?? []).slice(0, 5)} />
            </div>
            <div>
              <h4 className="mb-3 font-semibold">Top inferred decreases</h4>
              <TradesTable trades={(data?.topSells ?? []).slice(0, 5)} />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
