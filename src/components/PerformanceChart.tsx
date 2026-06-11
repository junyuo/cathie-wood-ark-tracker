import type { PerformancePoint } from "../types/ark";

export default function PerformanceChart({ data }: { data: PerformancePoint[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {data.map((item) => (
        <div key={item.label} className="rounded-lg border border-dashed border-slate-300 bg-white p-5">
          <h3 className="text-lg font-semibold">{item.label}</h3>
          <p className="mt-1 text-sm text-muted">Benchmark: {item.benchmark}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            {["CAGR", "Cumulative Return", "Maximum Drawdown", "Volatility", "Sharpe Ratio"].map((metric) => (
              <div key={metric} className="rounded-md bg-slate-50 p-3">
                <p className="text-muted">{metric}</p>
                <p className="mt-1 font-semibold">Performance data not available yet</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted">{item.note}</p>
        </div>
      ))}
    </div>
  );
}
