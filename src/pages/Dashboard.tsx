import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DataQuality from "../components/DataQuality";
import DashboardCards from "../components/DashboardCards";
import Disclaimer from "../components/Disclaimer";
import TopHoldingsChart from "../components/TopHoldingsChart";
import TradesTable from "../components/TradesTable";
import { loadArkData } from "../data";
import type { ArkData, ArkFund } from "../types/ark";
import { useI18n } from "../i18n/I18nContext";
import { completeSnapshotDates, FUNDS, hasCompleteComparisonBaseline } from "../utils/calculations";

export default function Dashboard() {
  const { t } = useI18n();
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
        <h2 className="text-xl font-semibold">{t("dashboard.title")}</h2>
        <p className="text-sm text-muted">{t("dashboard.description")}</p>
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
            <h3 className="text-lg font-semibold">{t("dashboard.top10")}</h3>
            <p className="text-sm text-muted">{t("dashboard.top10Help")}</p>
          </div>
          <label className="text-sm font-medium text-slate-700">
            {t("common.etf")}
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
            <h3 id="inferred-changes-heading" className="text-lg font-semibold">{t("dashboard.changes")}</h3>
            <p className="text-sm text-muted">{t("dashboard.changesHelp")}</p>
          </div>
          <Link className="text-sm font-semibold text-brand hover:underline" to="/trades">{t("dashboard.viewTrades")}</Link>
        </div>
        <Disclaimer />
        {!comparisonReady ? (
          <div className="rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
            <p className="font-semibold">{t("dashboard.baselineTitle")}</p>
            <p className="mt-1">{t("dashboard.baselineProgress", { count: completeDates.length })}</p>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            <div>
              <h4 className="mb-3 font-semibold">{t("dashboard.topIncreases")}</h4>
              <TradesTable trades={(data?.topBuys ?? []).slice(0, 5)} />
            </div>
            <div>
              <h4 className="mb-3 font-semibold">{t("dashboard.topDecreases")}</h4>
              <TradesTable trades={(data?.topSells ?? []).slice(0, 5)} />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
