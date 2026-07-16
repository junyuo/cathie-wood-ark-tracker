import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { loadArkData } from "../data";
import type { ArkData } from "../types/ark";
import { useI18n } from "../i18n/I18nContext";
import type { TranslationKey } from "../i18n/messages";
import { formatCurrency, formatNumber, formatPercent, formatSignedNumber } from "../utils/format";

export default function StockDetail() {
  const { locale, t } = useI18n();
  const params = useParams();
  const [ticker, setTicker] = useState(params.ticker ?? "TSLA");
  const [data, setData] = useState<ArkData | null>(null);

  useEffect(() => {
    loadArkData().then(setData);
  }, []);

  const normalized = ticker.trim().toUpperCase();
  const latestRows = (data?.latestHoldings ?? []).filter((holding) => holding.ticker === normalized);
  const recentChanges = (data?.dailyTrades ?? []).filter((trade) => trade.ticker === normalized);
  const history = (data?.holdingsHistory ?? []).filter((holding) => holding.ticker === normalized);
  const chartData = useMemo(() => {
    const dates = Array.from(new Set(history.map((row) => row.date))).sort();
    return dates.map((date) => {
      const point: Record<string, string | number | null> = { date };
      history.filter((row) => row.date === date).forEach((row) => {
        point[row.fund] = row.shares;
      });
      return point;
    });
  }, [history]);
  const totalMarketValue = latestRows.reduce((sum, row) => sum + row.marketValue, 0);
  const latestAction = recentChanges[0]
    ? `${recentChanges[0].fund} · ${t(`action.${recentChanges[0].action}` as TranslationKey)}`
    : t("stock.noAction");

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">{t("stock.title")}</h2>
        <p className="text-sm text-muted">{t("stock.description")}</p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <label className="text-sm font-medium text-slate-700">
          {t("stock.ticker")}
          <input className="mt-1 w-full max-w-xs rounded-md border border-slate-300 px-3 py-2" value={ticker} onChange={(event) => setTicker(event.target.value.toUpperCase())} />
        </label>
      </div>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [t("stock.heldBy"), latestRows.map((row) => row.fund).join(", ") || t("common.none")],
          [t("stock.totalValue"), formatCurrency(totalMarketValue, locale)],
          [t("stock.totalShares"), formatNumber(latestRows.reduce((sum, row) => sum + row.shares, 0), locale)],
          [t("stock.latestAction"), latestAction],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-muted">{label}</p>
            <p className="mt-2 break-words text-lg font-semibold">{value}</p>
          </div>
        ))}
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="font-semibold">{t("stock.latestHoldings")}</h3>
          <div className="mt-3 space-y-3">
            {latestRows.map((row) => (
              <div key={`${row.fund}-${row.ticker}`} className="rounded-md bg-slate-50 p-3 text-sm">
                <p className="font-semibold">{row.fund} · {row.company}</p>
                <p className="mt-1 text-muted">
                  {t("stock.holdingDetail", { shares: formatNumber(row.shares, locale), weight: formatPercent(row.weight, locale), rank: row.rankInFund ?? t("common.notAvailable") })}
                </p>
              </div>
            ))}
            {latestRows.length === 0 && <p className="text-sm text-muted">{t("stock.noHoldings", { ticker: normalized })}</p>}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="font-semibold">{t("stock.recentChanges")}</h3>
          <div className="mt-3 space-y-3">
            {recentChanges.map((trade) => (
              <div key={`${trade.fund}-${trade.ticker}-${trade.date}`} className="rounded-md bg-slate-50 p-3 text-sm">
                <p className="font-semibold">{trade.fund} · {t(`action.${trade.action}` as TranslationKey)}</p>
                <p className="mt-1 text-muted">{t("stock.changeDetail", { shares: formatSignedNumber(trade.shareChange, locale), weight: formatPercent(trade.weightChange, locale) })}</p>
              </div>
            ))}
            {recentChanges.length === 0 && <p className="text-sm text-muted">{t("stock.noChanges", { ticker: normalized })}</p>}
          </div>
        </div>
      </section>
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="font-semibold">{t("stock.trend")}</h3>
        {chartData.length >= 2 ? (
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                {latestRows.map((row) => (
                  <Line key={row.fund} connectNulls dataKey={row.fund} dot={false} stroke="#1f4f46" strokeWidth={2} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">{t("stock.trendNeedsHistory")}</p>
        )}
      </div>
    </div>
  );
}
