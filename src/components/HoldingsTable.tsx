import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import type { Holding } from "../types/ark";
import { formatCurrency, formatNumber, formatPercent } from "../utils/format";

export default function HoldingsTable({ holdings }: { holdings: Holding[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <p className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs text-muted md:hidden">Swipe horizontally to view all columns.</p>
      <div className="max-w-full overflow-x-auto" tabIndex={0} aria-label="Holdings table, horizontally scrollable">
        <table className="min-w-[980px] divide-y divide-slate-200 text-sm">
          <thead className="sticky top-0 z-20 bg-slate-50 text-left text-xs font-semibold uppercase text-muted">
            <tr>
              <th className="sticky left-0 z-30 w-20 min-w-20 bg-slate-50 px-4 py-3 md:static">Fund</th>
              <th className="sticky left-20 z-30 w-24 min-w-24 bg-slate-50 px-4 py-3 md:static">Ticker</th>
              <th className="px-4 py-3 text-right">Rank</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3 text-right">Shares</th>
              <th className="px-4 py-3 text-right">Market Value</th>
              <th className="px-4 py-3 text-right">Weight</th>
              <th className="px-4 py-3">Held By</th>
              <th className="px-4 py-3">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {holdings.map((holding) => (
              <tr key={`${holding.fund}-${holding.ticker}-${holding.date}`} className="group hover:bg-slate-50">
                <td className="sticky left-0 z-10 bg-white px-4 py-3 font-semibold group-hover:bg-slate-50 md:static">{holding.fund}</td>
                <td className="sticky left-20 z-10 bg-white px-4 py-3 font-semibold group-hover:bg-slate-50 md:static">
                  <Link className="text-brand hover:underline" to={`/stock/${holding.ticker}`}>{holding.ticker}</Link>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{holding.rankInFund ?? "n/a"}</td>
                <td className="px-4 py-3">{holding.company}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatNumber(holding.shares)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(holding.marketValue)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatPercent(holding.weight)}</td>
                <td className="px-4 py-3 text-muted">{holding.heldByFunds?.join(", ") ?? holding.fund}</td>
                <td className="px-4 py-3">
                  <a
                    className="inline-flex rounded p-1 text-brand hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    href={holding.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open ${holding.fund} source CSV`}
                    title={`Open ${holding.fund} source CSV`}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </td>
              </tr>
            ))}
            {holdings.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-muted" colSpan={9}>
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
