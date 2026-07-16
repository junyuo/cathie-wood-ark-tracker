import { Link } from "react-router-dom";
import type { DailyTrade } from "../types/ark";
import { useI18n } from "../i18n/I18nContext";
import type { TranslationKey } from "../i18n/messages";
import { actionClass } from "../utils/calculations";
import { formatCurrency, formatPercent, formatSignedNumber } from "../utils/format";

export default function TradesTable({ trades }: { trades: DailyTrade[] }) {
  const { locale, t } = useI18n();
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <p className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs text-muted md:hidden">{t("common.swipeTable")}</p>
      <div className="max-w-full overflow-x-auto" tabIndex={0} aria-label={t("trades.tableLabel")}>
        <table className="min-w-[920px] divide-y divide-slate-200 text-sm">
          <thead className="sticky top-0 z-20 bg-slate-50 text-left text-xs font-semibold uppercase text-muted">
            <tr>
              <th className="sticky left-0 z-30 w-20 min-w-20 bg-slate-50 px-4 py-3 md:static">{t("holdings.fund")}</th>
              <th className="sticky left-20 z-30 w-24 min-w-24 bg-slate-50 px-4 py-3 md:static">{t("holdings.ticker")}</th>
              <th className="px-4 py-3">{t("trades.date")}</th>
              <th className="px-4 py-3">{t("trades.action")}</th>
              <th className="px-4 py-3 text-right">{t("trades.shareChange")}</th>
              <th className="px-4 py-3 text-right">{t("trades.shareChangePercent")}</th>
              <th className="px-4 py-3 text-right">{t("trades.marketValueChange")}</th>
              <th className="px-4 py-3 text-right">{t("trades.weightChange")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {trades.map((trade) => (
              <tr key={`${trade.date}-${trade.fund}-${trade.ticker}-${trade.action}`} className="group hover:bg-slate-50">
                <td className="sticky left-0 z-10 bg-white px-4 py-3 font-semibold group-hover:bg-slate-50 md:static">{trade.fund}</td>
                <td className="sticky left-20 z-10 bg-white px-4 py-3 font-semibold group-hover:bg-slate-50 md:static">
                  <Link className="text-brand hover:underline" to={`/stock/${trade.ticker}`}>{trade.ticker}</Link>
                </td>
                <td className="px-4 py-3 text-muted">{trade.date}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ring-1 ${actionClass(trade.action)}`}>{t(`action.${trade.action}` as TranslationKey)}</span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{formatSignedNumber(trade.shareChange, locale)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatPercent(trade.shareChangePercent, locale)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(trade.marketValueChange, locale)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatPercent(trade.weightChange, locale)}</td>
              </tr>
            ))}
            {trades.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-muted" colSpan={8}>
                  {t("trades.empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
