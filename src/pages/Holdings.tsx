import { useEffect, useMemo, useState } from "react";
import FundSelector from "../components/FundSelector";
import HoldingsTable from "../components/HoldingsTable";
import { loadArkData } from "../data";
import type { ArkFund, Holding } from "../types/ark";
import { useI18n } from "../i18n/I18nContext";

type SortKey = "weight" | "marketValue" | "shares";
type LimitKey = "10" | "25" | "All";

export default function Holdings() {
  const { t } = useI18n();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [fund, setFund] = useState<ArkFund | "All">("All");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("weight");
  const [limit, setLimit] = useState<LimitKey>("25");

  useEffect(() => {
    loadArkData().then((data) => setHoldings(data.latestHoldings));
  }, []);

  const matching = useMemo(
    () => holdings
        .filter((holding) => fund === "All" || holding.fund === fund)
        .filter((holding) => `${holding.ticker} ${holding.company}`.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => b[sortKey] - a[sortKey]),
    [fund, holdings, query, sortKey],
  );
  const displayed = limit === "All" ? matching : matching.slice(0, Number(limit));
  const resultText = matching.length === holdings.length
    ? t("holdings.resultsAll", { shown: displayed.length, total: holdings.length })
    : t("holdings.resultsFiltered", { shown: displayed.length, matches: matching.length, total: holdings.length });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">{t("holdings.title")}</h2>
        <p className="text-sm text-muted">{t("holdings.description")}</p>
      </div>
      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
        <label className="text-sm font-medium text-slate-700">{t("common.etf")}<FundSelector id="holdings-fund" value={fund} onChange={setFund} /></label>
        <label className="text-sm font-medium text-slate-700">{t("holdings.companySearch")}
          <input id="holdings-search" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal" placeholder={t("holdings.searchPlaceholder")} value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <label className="text-sm font-medium text-slate-700">{t("holdings.sort")}
          <select id="holdings-sort" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal" value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)}>
            <option value="weight">{t("holdings.weight")}</option>
            <option value="marketValue">{t("holdings.marketValue")}</option>
            <option value="shares">{t("holdings.shares")}</option>
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">{t("holdings.rows")}
          <select id="holdings-limit" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal" value={limit} onChange={(event) => setLimit(event.target.value as LimitKey)}>
            <option value="10">{t("holdings.top10")}</option>
            <option value="25">{t("holdings.top25")}</option>
            <option value="All">{t("holdings.allRows")}</option>
          </select>
        </label>
      </div>
      <p className="text-sm text-muted" aria-live="polite">{resultText}</p>
      <HoldingsTable holdings={displayed} />
    </div>
  );
}
