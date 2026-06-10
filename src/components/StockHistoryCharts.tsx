import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FUNDS } from "../data";
import type { Holding } from "../types/ark";

interface Props {
  history: Holding[];
  ticker: string;
}

const colors = {
  ARKK: "#28584a",
  ARKW: "#2563eb",
  ARKG: "#7c3aed",
  ARKQ: "#c2410c",
  ARKF: "#0f766e",
  ARKX: "#be123c",
};

function buildChartData(history: Holding[], valueKey: "weight" | "shares") {
  const dates = Array.from(new Set(history.map((item) => item.date))).sort();
  return dates.map((date) => {
    const point: Record<string, string | number | null> = { date };
    for (const fund of FUNDS) {
      const row = history.find((item) => item.date === date && item.fund === fund);
      point[fund] = row ? row[valueKey] : null;
    }
    return point;
  });
}

function HistoryChart({ title, data, suffix }: { title: string; data: Record<string, string | number | null>[]; suffix?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-base font-semibold">{title}</h3>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => [`${Number(value).toLocaleString()}${suffix ?? ""}`, ""]} />
            {FUNDS.map((fund) => (
              <Line key={fund} connectNulls dataKey={fund} dot={false} stroke={colors[fund]} strokeWidth={2} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function StockHistoryCharts({ history, ticker }: Props) {
  const dates = new Set(history.map((item) => item.date));
  if (dates.size < 2) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
        Historical charts for {ticker.toUpperCase()} need at least two holdings snapshots. Current data has {dates.size} matching snapshot{dates.size === 1 ? "" : "s"}.
      </div>
    );
  }

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <HistoryChart title={`${ticker.toUpperCase()} weight over time`} data={buildChartData(history, "weight")} suffix="%" />
      <HistoryChart title={`${ticker.toUpperCase()} shares over time`} data={buildChartData(history, "shares")} />
    </section>
  );
}
