import type { DailyTrade } from "../types/ark";
import { actionClass } from "../utils/calculations";
import { formatPercent, formatSignedNumber } from "../utils/format";

export default function TradesTable({ trades }: { trades: DailyTrade[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Fund</th>
              <th className="px-4 py-3">Ticker</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3 text-right">Shares Change</th>
              <th className="px-4 py-3 text-right">Share Change %</th>
              <th className="px-4 py-3 text-right">Weight Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {trades.map((trade) => (
              <tr key={`${trade.date}-${trade.fund}-${trade.ticker}-${trade.action}`} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-muted">{trade.date}</td>
                <td className="px-4 py-3 font-semibold">{trade.fund}</td>
                <td className="px-4 py-3 font-semibold text-brand">{trade.ticker}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ring-1 ${actionClass(trade.action)}`}>{trade.action}</span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{formatSignedNumber(trade.shareChange)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatPercent(trade.shareChangePercent)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatPercent(trade.weightChange)}</td>
              </tr>
            ))}
            {trades.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-muted" colSpan={7}>
                  No holding changes match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
