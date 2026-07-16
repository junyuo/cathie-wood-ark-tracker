import { ArrowDownRight, ArrowUpRight, CalendarDays, Layers, Network, Table2 } from "lucide-react";
import type { DailyTrade, Holding } from "../types/ark";
import { useI18n } from "../i18n/I18nContext";
import { formatNumber, formatPercent, formatSignedNumber } from "../utils/format";
import { FUNDS, latestDate, sharedTickerLeader } from "../utils/calculations";

interface Props {
  holdings: Holding[];
  topBuy?: DailyTrade;
  topSell?: DailyTrade;
  comparisonReady: boolean;
}

export default function DashboardCards({ holdings, topBuy, topSell, comparisonReady }: Props) {
  const { locale, t } = useI18n();
  const shared = sharedTickerLeader(holdings);
  const cards = [
    { label: t("cards.latestDate"), value: latestDate(holdings, t("common.noData")), detail: t("cards.publicHoldings"), icon: CalendarDays },
    { label: t("cards.trackedEtfs"), value: formatNumber(FUNDS.length, locale), detail: FUNDS.join(", "), icon: Layers },
    { label: t("cards.totalRows"), value: formatNumber(holdings.length, locale), detail: t("cards.normalizedRows"), icon: Table2 },
    {
      label: t("cards.largestIncrease"),
      value: !comparisonReady ? t("cards.baselinePending") : topBuy ? `${topBuy.fund} ${topBuy.ticker}` : t("common.noData"),
      detail: !comparisonReady
        ? t("cards.needsSnapshots")
        : topBuy
          ? t("cards.changeDetail", { shares: formatSignedNumber(topBuy.shareChange, locale), percent: formatPercent(topBuy.shareChangePercent, locale) })
          : t("cards.noIncreases"),
      icon: ArrowUpRight,
    },
    {
      label: t("cards.largestDecrease"),
      value: !comparisonReady ? t("cards.baselinePending") : topSell ? `${topSell.fund} ${topSell.ticker}` : t("common.noData"),
      detail: !comparisonReady
        ? t("cards.needsSnapshots")
        : topSell
          ? t("cards.changeDetail", { shares: formatSignedNumber(topSell.shareChange, locale), percent: formatPercent(topSell.shareChangePercent, locale) })
          : t("cards.noDecreases"),
      icon: ArrowDownRight,
    },
    {
      label: t("cards.sharedTicker"),
      value: shared ? shared[0] : t("common.noData"),
      detail: shared ? t("cards.heldByEtfs", { count: formatNumber(shared[1].size, locale) }) : t("cards.noOverlap"),
      icon: Network,
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map(({ label, value, detail, icon: Icon }) => (
        <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-muted">{label}</p>
            <Icon className="h-5 w-5 text-brand" />
          </div>
          <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
          <p className="mt-1 text-sm text-muted">{detail}</p>
        </div>
      ))}
    </section>
  );
}
