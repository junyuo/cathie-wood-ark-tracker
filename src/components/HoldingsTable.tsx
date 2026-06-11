import type { Holding } from "../types/ark";
import { formatCurrency, formatNumber, formatPercent } from "../utils/format";

export default function HoldingsTable({ holdings }: { holdings: Holding[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Fund</th>
              <th className="px-4 py-3 text-right">Rank</th>
              <th className="px-4 py-3">Ticker</th>
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
              <tr key={`${holding.fund}-${holding.ticker}-${holding.date}`} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold">{holding.fund}</td>
                <td className="px-4 py-3 text-right tabular-nums">{holding.rankInFund ?? "n/a"}</td>
                <td className="px-4 py-3 font-semibold text-brand">{holding.ticker}</td>
                <td className="px-4 py-3">{holding.company}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatNumber(holding.shares)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(holding.marketValue)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatPercent(holding.weight)}</td>
                <td className="px-4 py-3 text-muted">{holding.heldByFunds?.join(", ") ?? holding.fund}</td>
                <td className="px-4 py-3">
                  <a className="font-medium text-brand hover:underline" href={holding.sourceUrl} target="_blank" rel="noreferrer">
                    ARK CSV
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
