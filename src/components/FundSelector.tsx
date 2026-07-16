import type { ArkFund } from "../types/ark";
import { FUNDS } from "../utils/calculations";

interface Props {
  value: ArkFund | "All";
  onChange: (value: ArkFund | "All") => void;
  id?: string;
}

export default function FundSelector({ value, onChange, id }: Props) {
  return (
    <select id={id} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-normal" value={value} onChange={(event) => onChange(event.target.value as ArkFund | "All")}>
      <option value="All">All ETFs</option>
      {FUNDS.map((fund) => (
        <option key={fund} value={fund}>
          {fund}
        </option>
      ))}
    </select>
  );
}
