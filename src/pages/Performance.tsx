import { useEffect, useState } from "react";
import PerformanceChart from "../components/PerformanceChart";
import { loadData } from "../data";
import type { PerformancePoint } from "../types/ark";

export default function Performance() {
  const [performance, setPerformance] = useState<PerformancePoint[]>([]);

  useEffect(() => {
    loadData().then((data) => setPerformance(data.performance));
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Performance</h2>
        <p className="text-sm text-slate-600">First version keeps performance data separate from holdings data.</p>
      </div>
      <PerformanceChart data={performance} />
    </div>
  );
}
