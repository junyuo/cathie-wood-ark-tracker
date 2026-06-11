import type { ArkFund } from "../types/ark";
import { FUNDS } from "../utils/calculations";

interface Props {
  value: ArkFund | "All";
  onChange: (value: ArkFund | "All") => void;
}

export default function FundSelector({ value, onChange }: Props) {
  return (
    <select className="rounded-md border border-slate-300 bg-white px-3 py-2" value={value} onChange={(event) => onChange(event.target.value as ArkFund | "All")}>
      <option value="All">All ETFs</option>
      {FUNDS.map((fund) => (
        <option key={fund} value={fund}>
          {fund}
        </option>
      ))}
    </select>
  );
}
