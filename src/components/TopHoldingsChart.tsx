import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ArkFund, Holding } from "../types/ark";
import { useI18n } from "../i18n/I18nContext";

export default function TopHoldingsChart({ fund, holdings }: { fund: ArkFund; holdings: Holding[] }) {
  const { locale, t } = useI18n();
  const data = holdings
    .filter((holding) => holding.fund === fund)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 10)
    .map((holding) => ({ ticker: holding.ticker, weight: holding.weight }));

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-base font-semibold">{t("chart.top10", { fund })}</h3>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="ticker" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => [new Intl.NumberFormat(locale === "zh-TW" ? "zh-TW" : "en-US", { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value) / 100), t("chart.weight")]} />
            <Bar dataKey="weight" fill="#1f4f46" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
