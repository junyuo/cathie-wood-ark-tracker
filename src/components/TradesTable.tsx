import { formatCurrency, formatNumber, formatPercent } from "../data";
import type { Trade } from "../types/ark";

export default function TradesTable({ trades }: { trades: Trade[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Fund</th>
              <th className="px-4 py-3">Ticker</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3 text-right">Shares Change</th>
              <th className="px-4 py-3 text-right">Percent Change</th>
              <th className="px-4 py-3 text-right">Market Value Change</th>
              <th className="px-4 py-3 text-right">Current Market Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {trades.map((trade) => (
              <tr key={`${trade.date}-${trade.fund}-${trade.ticker}-${trade.action}`} className="hover:bg-mint/40">
                <td className="px-4 py-3 text-slate-500">{trade.date}</td>
                <td className="px-4 py-3 font-semibold">{trade.fund}</td>
                <td className="px-4 py-3 font-semibold text-moss">{trade.ticker}</td>
                <td className="px-4 py-3">
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold">{trade.action}</span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{formatNumber(trade.sharesChange)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatPercent(trade.percentChange)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(trade.marketValueChange)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(trade.currentMarketValue)}</td>
              </tr>
            ))}
            {trades.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={8}>
                  No trades match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
