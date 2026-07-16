import { useEffect, useState } from "react";
import TopHoldingsChart from "../components/TopHoldingsChart";
import { loadArkData } from "../data";
import type { ArkData } from "../types/ark";
import { useI18n } from "../i18n/I18nContext";
import { formatCurrency, formatNumber, formatPercent } from "../utils/format";

export default function Funds() {
  const { locale, t } = useI18n();
  const [data, setData] = useState<ArkData | null>(null);

  useEffect(() => {
    loadArkData().then(setData);
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">{t("funds.title")}</h2>
        <p className="text-sm text-muted">{t("funds.description")}</p>
      </div>
      <section className="grid gap-4 lg:grid-cols-2">
        {(data?.fundSummary ?? []).map((summary) => (
          <div key={summary.fund} className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div>
              <h3 className="text-lg font-semibold">{summary.fund}</h3>
              <p className="text-sm text-muted">{summary.fundName}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
              <p>{t("funds.latestDate")}: <span className="font-semibold">{summary.date}</span></p>
              <p>{t("funds.holdings")}: <span className="font-semibold">{formatNumber(summary.holdingsCount, locale)}</span></p>
              <p>{t("funds.value")}: <span className="font-semibold">{formatCurrency(summary.totalMarketValue, locale)}</span></p>
              <p>{t("funds.top10Weight")}: <span className="font-semibold">{formatPercent(summary.topTenWeight, locale)}</span></p>
              <p>{t("funds.increases")}: <span className="font-semibold text-buy">{formatNumber(summary.buyCount, locale)}</span></p>
              <p>{t("funds.decreases")}: <span className="font-semibold text-sell">{formatNumber(summary.sellCount, locale)}</span></p>
            </div>
            {data && <TopHoldingsChart fund={summary.fund} holdings={data.latestHoldings} />}
          </div>
        ))}
      </section>
    </div>
  );
}
