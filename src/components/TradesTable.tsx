import { Link } from "react-router-dom";
import type { DailyTrade } from "../types/ark";
import { actionClass } from "../utils/calculations";
import { formatCurrency, formatPercent, formatSignedNumber } from "../utils/format";

export default function TradesTable({ trades }: { trades: DailyTrade[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <p className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs text-muted md:hidden">Swipe horizontally to view all columns.</p>
      <div className="max-w-full overflow-x-auto" tabIndex={0} aria-label="Holding changes table, horizontally scrollable">
        <table className="min-w-[920px] divide-y divide-slate-200 text-sm">
          <thead className="sticky top-0 z-20 bg-slate-50 text-left text-xs font-semibold uppercase text-muted">
            <tr>
              <th className="sticky left-0 z-30 w-20 min-w-20 bg-slate-50 px-4 py-3 md:static">Fund</th>
              <th className="sticky left-20 z-30 w-24 min-w-24 bg-slate-50 px-4 py-3 md:static">Ticker</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3 text-right">Shares Change</th>
              <th className="px-4 py-3 text-right">Share Change %</th>
              <th className="px-4 py-3 text-right">Market Value Change</th>
              <th className="px-4 py-3 text-right">Weight Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {trades.map((trade) => (
              <tr key={`${trade.date}-${trade.fund}-${trade.ticker}-${trade.action}`} className="group hover:bg-slate-50">
                <td className="sticky left-0 z-10 bg-white px-4 py-3 font-semibold group-hover:bg-slate-50 md:static">{trade.fund}</td>
                <td className="sticky left-20 z-10 bg-white px-4 py-3 font-semibold group-hover:bg-slate-50 md:static">
                  <Link className="text-brand hover:underline" to={`/stock/${trade.ticker}`}>{trade.ticker}</Link>
                </td>
                <td className="px-4 py-3 text-muted">{trade.date}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ring-1 ${actionClass(trade.action)}`}>{trade.action}</span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{formatSignedNumber(trade.shareChange)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatPercent(trade.shareChangePercent)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(trade.marketValueChange)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatPercent(trade.weightChange)}</td>
              </tr>
            ))}
            {trades.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-muted" colSpan={8}>
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
