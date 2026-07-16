import { useEffect, useState } from "react";
import PerformanceChart from "../components/PerformanceChart";
import { loadArkData } from "../data";
import type { PerformancePoint } from "../types/ark";
import { useI18n } from "../i18n/I18nContext";

export default function Performance() {
  const { t } = useI18n();
  const [data, setData] = useState<PerformancePoint[]>([]);

  useEffect(() => {
    loadArkData().then((payload) => setData(payload.performance));
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">{t("performance.title")}</h2>
        <p className="text-sm text-muted">{t("performance.description")}</p>
      </div>
      <PerformanceChart data={data} />
    </div>
  );
}
