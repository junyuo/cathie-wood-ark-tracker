import { AlertTriangle, CheckCircle2, ExternalLink, XCircle } from "lucide-react";
import { FUNDS } from "../data";
import type { DataStatus, FundDataStatus } from "../types/ark";

function statusStyles(status: FundDataStatus["status"]) {
  if (status === "success") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "failed") return "bg-rose-50 text-rose-700 ring-rose-200";
  return "bg-amber-50 text-amber-700 ring-amber-200";
}

function statusIcon(status: FundDataStatus["status"]) {
  if (status === "success") return <CheckCircle2 className="h-4 w-4" />;
  if (status === "failed") return <XCircle className="h-4 w-4" />;
  return <AlertTriangle className="h-4 w-4" />;
}

function freshnessLabel(status: DataStatus) {
  if (status.freshnessStatus === "unknown") return "Freshness unknown";
  const age = status.dataAgeDays === null ? "" : ` · ${status.dataAgeDays} day${status.dataAgeDays === 1 ? "" : "s"} old`;
  if (status.freshnessStatus === "fresh") return `Fresh${age}`;
  if (status.freshnessStatus === "stale") return `Stale${age}`;
  return `Old${age}`;
}

function freshnessStyles(status: DataStatus["freshnessStatus"]) {
  if (status === "fresh") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "stale") return "bg-amber-50 text-amber-800 ring-amber-200";
  if (status === "old") return "bg-rose-50 text-rose-700 ring-rose-200";
  return "bg-slate-100 text-slate-600 ring-slate-200";
}

export default function DataStatusPanel({ status }: { status: DataStatus }) {
  const hasWarnings =
    status.isSampleData ||
    status.warnings.length > 0 ||
    status.freshnessStatus === "stale" ||
    status.freshnessStatus === "old" ||
    FUNDS.some((fund) => status.funds[fund]?.status !== "success");

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Data Status</h2>
          <p className="text-sm text-slate-600">
            Last successful update: {status.lastSuccessfulUpdate ?? "No successful live update yet"} · Latest holding date: {status.latestHoldingDate ?? "No data"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`inline-flex w-fit items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ring-1 ${freshnessStyles(status.freshnessStatus)}`}>
            {freshnessLabel(status)}
          </span>
          {hasWarnings && (
            <span className="inline-flex w-fit items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 ring-1 ring-amber-200">
              <AlertTriangle className="h-4 w-4" />
              Review data warnings
            </span>
          )}
        </div>
      </div>

      {status.isSampleData && (
        <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 ring-1 ring-amber-200">
          Seed/sample holdings are loaded only to keep the static dashboard usable before the first successful ARK source update. Trade summary cards are muted while sample data is active.
        </p>
      )}

      {status.warnings.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm text-slate-600">
          {status.warnings.map((warning) => (
            <li key={warning}>• {warning}</li>
          ))}
        </ul>
      )}

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {FUNDS.map((fund) => {
          const fundStatus = status.funds[fund];
          return (
            <div key={fund} className="rounded-md border border-slate-200 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">{fund}</p>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ring-1 ${statusStyles(fundStatus.status)}`}>
                  {statusIcon(fundStatus.status)}
                  {fundStatus.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{fundStatus.rowCount} rows</p>
              {fundStatus.sourceUrl && (
                <a className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-moss hover:underline" href={fundStatus.sourceUrl} target="_blank" rel="noreferrer">
                  Source <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              {fundStatus.error && <p className="mt-2 line-clamp-3 text-xs text-rose-700">{fundStatus.error}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
