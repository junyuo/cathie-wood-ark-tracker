import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PerformancePoint } from "../types/ark";

export default function PerformanceChart({ data }: { data: PerformancePoint[] }) {
  const hasValues = data.some((item) => item.arkk !== null || item.qqq !== null || item.spy !== null);

  if (!hasValues) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-slate-600">
        <h2 className="text-lg font-semibold text-ink">ARKK vs QQQ vs SPY</h2>
        <p className="mt-2">
          Price performance is intentionally left as a placeholder until a no-key, reproducible market data source is
          added. This MVP tracks ARK ETF holdings first and avoids hard-coded fake performance data.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line dataKey="arkk" stroke="#28584a" strokeWidth={2} dot={false} />
            <Line dataKey="qqq" stroke="#2563eb" strokeWidth={2} dot={false} />
            <Line dataKey="spy" stroke="#7c3aed" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
