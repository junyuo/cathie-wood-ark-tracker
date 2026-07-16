import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { DataStatus, FundDataStatus } from "../types/ark";
import { useI18n } from "../i18n/I18nContext";
import type { Locale } from "../i18n/locale";
import type { TranslationKey } from "../i18n/messages";
import { FUNDS } from "../utils/calculations";
import { hasDataIssue, successfulFundCount } from "../utils/dataQuality";

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

function freshnessText(status: DataStatus, t: ReturnType<typeof useI18n>["t"]) {
  if (status.freshnessStatus === "unknown") return t("freshness.unknown");
  const freshness = t(`freshness.${status.freshnessStatus}` as TranslationKey);
  const age = status.dataAgeDays === null
    ? ""
    : ` · ${status.dataAgeDays === 1 ? t("freshness.ageOne") : t("freshness.ageMany", { count: status.dataAgeDays })}`;
  return `${freshness}${age}`;
}

function formatTimestamp(value: string | null, locale: Locale, noLive: string) {
  if (!value) return noLive;
  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) return value;
  return new Intl.DateTimeFormat(locale === "zh-TW" ? "zh-TW" : "en-US", { dateStyle: "medium", timeStyle: "short" }).format(timestamp);
}

export default function DataQuality({ status }: { status: DataStatus }) {
  const { locale, t } = useI18n();
  const diagnostic = (value: string) => {
    if (value === "No data status file was found.") return t("quality.noStatusFile");
    if (value === "data_status.json has not been generated yet.") return t("quality.statusNotGenerated");
    if (value === missingStatus.error) return t("quality.missingStatus");
    return locale === "zh-TW" ? `${t("quality.originalDiagnostic")}：${value}` : value;
  };
  const hasIssue = hasDataIssue(status);
  const successfulFunds = successfulFundCount(status);

  return (
    <section aria-labelledby="data-quality-heading" className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <h3 id="data-quality-heading" className="sr-only">{t("quality.heading")}</h3>
      <details open={hasIssue}>
        <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-2 gap-y-1 px-4 py-3 text-sm marker:hidden">
          <span
            className={`inline-flex items-center gap-2 font-semibold ${hasIssue ? "text-amber-800" : "text-buy"}`}
          >
            {hasIssue ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            {hasIssue ? t("quality.review") : t("quality.healthy")}
          </span>
          <span className="text-slate-300" aria-hidden="true">·</span>
          <span className="text-muted">{status.latestHoldingDate ?? t("quality.noDate")}</span>
          <span className="text-slate-300" aria-hidden="true">·</span>
          <span className="text-muted">{t("quality.etfCount", { success: successfulFunds, total: FUNDS.length })}</span>
          <span className="text-slate-300" aria-hidden="true">·</span>
          <span className="text-muted">{t("quality.checked", { time: formatTimestamp(status.updatedAt, locale, t("quality.noLive")) })}</span>
          <span className="ml-auto text-xs font-medium text-brand">{t("common.details")}</span>
        </summary>
        <div className="border-t border-slate-200 px-4 pb-4 pt-3">
          <p className="text-sm text-muted">
            {t("quality.lastSuccess", { time: formatTimestamp(status.lastSuccessfulUpdate, locale, t("quality.noLive")) })} · {t("quality.latest", { date: status.latestHoldingDate ?? t("common.noData") })} · {freshnessText(status, t)}
          </p>
          {status.isSampleData && (
            <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {t("quality.sample")}
            </p>
          )}
          {status.warnings.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm text-muted">
              {status.warnings.map((warning) => (
                <li key={warning}>• {diagnostic(warning)}</li>
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
                      {t(`status.${fundStatus.status}` as TranslationKey)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted">{t("common.rows", { count: fundStatus.rowCount })}</p>
                  {fundStatus.sourceUrl && (
                    <a className="mt-1 inline-block text-sm font-medium text-brand hover:underline" href={fundStatus.sourceUrl} target="_blank" rel="noreferrer">
                      {t("common.source")}
                    </a>
                  )}
                  {fundStatus.error && (
                    <p className="mt-2 line-clamp-3 text-xs text-sell">
                      {diagnostic(fundStatus.error)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </details>
    </section>
  );
}
