import type { PerformancePoint } from "../types/ark";
import { useI18n } from "../i18n/I18nContext";
import type { TranslationKey } from "../i18n/messages";

const metrics: TranslationKey[] = ["performance.cagr", "performance.cumulative", "performance.drawdown", "performance.volatility", "performance.sharpe"];

export default function PerformanceChart({ data }: { data: PerformancePoint[] }) {
  const { t } = useI18n();
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {data.map((item) => (
        <div key={item.label} className="rounded-lg border border-dashed border-slate-300 bg-white p-5">
          <h3 className="text-lg font-semibold">{item.label}</h3>
          <p className="mt-1 text-sm text-muted">{t("performance.benchmark", { benchmark: item.benchmark })}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            {metrics.map((metric) => (
              <div key={metric} className="rounded-md bg-slate-50 p-3">
                <p className="text-muted">{t(metric)}</p>
                <p className="mt-1 font-semibold">{t("performance.unavailable")}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted">{t("performance.note")}</p>
        </div>
      ))}
    </div>
  );
}
