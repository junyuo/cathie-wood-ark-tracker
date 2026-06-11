import { useEffect, useState } from "react";
import PerformanceChart from "../components/PerformanceChart";
import { loadArkData } from "../data";
import type { PerformancePoint } from "../types/ark";

export default function Performance() {
  const [data, setData] = useState<PerformancePoint[]>([]);

  useEffect(() => {
    loadArkData().then((payload) => setData(payload.performance));
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Performance</h2>
        <p className="text-sm text-muted">Benchmark comparison structure is ready. No fake price-derived metrics are generated in this MVP.</p>
      </div>
      <PerformanceChart data={data} />
    </div>
  );
}
