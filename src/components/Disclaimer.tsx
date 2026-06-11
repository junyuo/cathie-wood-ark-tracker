export default function Disclaimer() {
  return (
    <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <p className="font-semibold">Data limitation</p>
      <p className="mt-1">
        This site tracks public ARK Invest ETF holdings disclosures. Inferred Buy/Sell labels are based on share-count changes between ETF holding snapshots and are not Cathie Wood personal trades or broker trade confirmations.
      </p>
    </section>
  );
}
