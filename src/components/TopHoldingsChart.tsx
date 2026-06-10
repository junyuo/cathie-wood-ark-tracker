import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Holding } from "../types/ark";

export default function TopHoldingsChart({ holdings, fund }: { holdings: Holding[]; fund: string }) {
  const data = holdings
    .filter((item) => item.fund === fund)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 10)
    .map((item) => ({ ticker: item.ticker, weight: item.weight }));

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-base font-semibold">{fund} Top 10 holdings</h3>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 0, right: 12, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="ticker" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => [`${Number(value).toFixed(2)}%`, "Weight"]} />
            <Bar dataKey="weight" fill="#28584a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
