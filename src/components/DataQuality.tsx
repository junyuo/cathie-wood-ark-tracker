import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { DataStatus, FundDataStatus } from "../types/ark";
import { FUNDS } from "../utils/calculations";

const missingStatus: FundDataStatus = {
  status: "missing",
  rowCount: 0,
  sourceUrl: "",
  error: "No status entry was published for this ETF.",
};

function statusStyle(status: FundDataStatus["status"]) {
  if (status === "success") return "bg-emerald-50 text-buy ring-emerald-200";
  if (status === "failed") return "bg-red-50 text-sell ring-red-200";
  if (status === "sample") return "bg-sky-50 text-sky-800 ring-sky-200";
  return "bg-amber-50 text-amber-800 ring-amber-200";
}

function statusIcon(status: FundDataStatus["status"]) {
  if (status === "success") return <CheckCircle2 className="h-4 w-4" />;
  if (status === "failed") return <XCircle className="h-4 w-4" />;
  return <AlertTriangle className="h-4 w-4" />;
}

function freshnessText(status: DataStatus) {
  if (status.freshnessStatus === "unknown") return "Freshness unknown";
  const age = status.dataAgeDays === null ? "" : ` · ${status.dataAgeDays} day${status.dataAgeDays === 1 ? "" : "s"} old`;
  return `${status.freshnessStatus}${age}`;
}

function formatTimestamp(value: string | null) {
  if (!value) return "No live update yet";
  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(timestamp);
}

export default function DataQuality({ status }: { status: DataStatus }) {
  const hasIssue =
    status.isSampleData ||
    status.warnings.length > 0 ||
    status.freshnessStatus !== "fresh" ||
    FUNDS.some((fund) => status.funds[fund]?.status !== "success");
  const successfulFunds = FUNDS.filter((fund) => status.funds[fund]?.status === "success").length;

  return (
    <section aria-labelledby="data-quality-heading" className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <h3 id="data-quality-heading" className="sr-only">Data Quality</h3>
      <details open={hasIssue}>
        <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-2 gap-y-1 px-4 py-3 text-sm marker:hidden">
          <span
            className={`inline-flex items-center gap-2 font-semibold ${hasIssue ? "text-amber-800" : "text-buy"}`}
          >
            {hasIssue ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            {hasIssue ? "Review data status" : "Current data healthy"}
          </span>
          <span className="text-slate-300" aria-hidden="true">·</span>
          <span className="text-muted">{status.latestHoldingDate ?? "No holdings date"}</span>
          <span className="text-slate-300" aria-hidden="true">·</span>
          <span className="text-muted">{successfulFunds}/{FUNDS.length} ETFs</span>
          <span className="text-slate-300" aria-hidden="true">·</span>
          <span className="text-muted">checked {formatTimestamp(status.updatedAt)}</span>
          <span className="ml-auto text-xs font-medium text-brand">Details</span>
        </summary>
        <div className="border-t border-slate-200 px-4 pb-4 pt-3">
          <p className="text-sm text-muted">
            Last success: {formatTimestamp(status.lastSuccessfulUpdate)} · Latest holdings: {status.latestHoldingDate ?? "No data"} · {freshnessText(status)}
          </p>
          {status.isSampleData && (
            <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Sample data is active until the first successful ARK source update completes.
            </p>
          )}
          {status.warnings.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm text-muted">
              {status.warnings.map((warning) => (
                <li key={warning}>• {warning}</li>
              ))}
            </ul>
          )}
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {FUNDS.map((fund) => {
              const fundStatus = status.funds[fund] ?? missingStatus;
              return (
                <div key={fund} className="rounded-md border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{fund}</p>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ring-1 ${statusStyle(fundStatus.status)}`}>
                      {statusIcon(fundStatus.status)}
                      {fundStatus.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted">{fundStatus.rowCount} rows</p>
                  {fundStatus.sourceUrl && (
                    <a className="mt-1 inline-block text-sm font-medium text-brand hover:underline" href={fundStatus.sourceUrl} target="_blank" rel="noreferrer">
                      Source
                    </a>
                  )}
                  {fundStatus.error && <p className="mt-2 line-clamp-3 text-xs text-sell">{fundStatus.error}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </details>
    </section>
  );
}
