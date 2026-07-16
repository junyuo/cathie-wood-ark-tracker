import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import type { Holding } from "../types/ark";
import { useI18n } from "../i18n/I18nContext";
import { formatCurrency, formatNumber, formatPercent } from "../utils/format";

export default function HoldingsTable({ holdings }: { holdings: Holding[] }) {
  const { locale, t } = useI18n();
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <p className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs text-muted md:hidden">{t("common.swipeTable")}</p>
      <div className="max-w-full overflow-x-auto" tabIndex={0} aria-label={t("holdings.tableLabel")}>
        <table className="min-w-[980px] divide-y divide-slate-200 text-sm">
          <thead className="sticky top-0 z-20 bg-slate-50 text-left text-xs font-semibold uppercase text-muted">
            <tr>
              <th className="sticky left-0 z-30 w-20 min-w-20 bg-slate-50 px-4 py-3 md:static">{t("holdings.fund")}</th>
              <th className="sticky left-20 z-30 w-24 min-w-24 bg-slate-50 px-4 py-3 md:static">{t("holdings.ticker")}</th>
              <th className="px-4 py-3 text-right">{t("holdings.rank")}</th>
              <th className="px-4 py-3">{t("holdings.company")}</th>
              <th className="px-4 py-3 text-right">{t("holdings.shares")}</th>
              <th className="px-4 py-3 text-right">{t("holdings.marketValue")}</th>
              <th className="px-4 py-3 text-right">{t("holdings.weight")}</th>
              <th className="px-4 py-3">{t("holdings.heldBy")}</th>
              <th className="px-4 py-3">{t("holdings.source")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {holdings.map((holding) => (
              <tr key={`${holding.fund}-${holding.ticker}-${holding.date}`} className="group hover:bg-slate-50">
                <td className="sticky left-0 z-10 bg-white px-4 py-3 font-semibold group-hover:bg-slate-50 md:static">{holding.fund}</td>
                <td className="sticky left-20 z-10 bg-white px-4 py-3 font-semibold group-hover:bg-slate-50 md:static">
                  <Link className="text-brand hover:underline" to={`/stock/${holding.ticker}`}>{holding.ticker}</Link>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{holding.rankInFund ?? t("common.notAvailable")}</td>
                <td className="px-4 py-3">{holding.company}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatNumber(holding.shares, locale)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(holding.marketValue, locale)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatPercent(holding.weight, locale)}</td>
                <td className="px-4 py-3 text-muted">{holding.heldByFunds?.join(", ") ?? holding.fund}</td>
                <td className="px-4 py-3">
                  <a
                    className="inline-flex rounded p-1 text-brand hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    href={holding.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={t("holdings.openSource", { fund: holding.fund })}
                    title={t("holdings.openSource", { fund: holding.fund })}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </td>
              </tr>
            ))}
            {holdings.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-muted" colSpan={9}>
                  {t("holdings.empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
