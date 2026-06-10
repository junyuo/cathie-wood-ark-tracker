import { Link } from "react-router-dom";
import { formatCurrency, formatNumber } from "../data";
import type { Holding } from "../types/ark";

export default function HoldingsTable({ holdings }: { holdings: Holding[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Fund</th>
              <th className="px-4 py-3">Ticker</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3 text-right">Shares</th>
              <th className="px-4 py-3 text-right">Market Value</th>
              <th className="px-4 py-3 text-right">Weight</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {holdings.map((item) => (
              <tr key={`${item.fund}-${item.ticker}-${item.date}`} className="hover:bg-mint/40">
                <td className="px-4 py-3 font-semibold">{item.fund}</td>
                <td className="px-4 py-3">
                  <Link className="font-semibold text-moss hover:underline" to={`/stock/${item.ticker}`}>
                    {item.ticker}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-700">{item.company}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatNumber(item.shares)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(item.marketValue)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{item.weight.toFixed(2)}%</td>
                <td className="px-4 py-3 text-slate-500">{item.date}</td>
              </tr>
            ))}
            {holdings.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={7}>
                  No holdings match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
