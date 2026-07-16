import type { ArkFund } from "../types/ark";
import { FUNDS } from "../utils/calculations";
import { useI18n } from "../i18n/I18nContext";

interface Props {
  value: ArkFund | "All";
  onChange: (value: ArkFund | "All") => void;
  id?: string;
}

export default function FundSelector({ value, onChange, id }: Props) {
  const { t } = useI18n();
  return (
    <select id={id} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-normal" value={value} onChange={(event) => onChange(event.target.value as ArkFund | "All")}>
      <option value="All">{t("fundSelector.all")}</option>
      {FUNDS.map((fund) => (
        <option key={fund} value={fund}>
          {fund}
        </option>
      ))}
    </select>
  );
}
