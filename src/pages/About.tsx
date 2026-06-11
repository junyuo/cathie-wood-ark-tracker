import Disclaimer from "../components/Disclaimer";

export default function About() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">About / Disclaimer</h2>
        <p className="text-sm text-muted">Methodology and data limitations for the ARK Invest ETF holdings tracker.</p>
      </div>
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="space-y-4 text-sm leading-6 text-slate-700">
          <p>This website uses public ARK Invest ETF holdings disclosures for ARKK, ARKW, ARKG, ARKQ, ARKF, and ARKX.</p>
          <p>It is not a record of Cathie Wood's personal brokerage account, personal trades, or private transactions.</p>
          <p>ETF holding changes may reflect ETF creations and redemptions, portfolio activity, market movement, or disclosure timing. Inferred Buy/Sell labels are based primarily on share-count changes between snapshots.</p>
          <p>This website is for research and education only. It is not investment advice. Users should verify important data against official ARK Invest sources.</p>
          <p>Data may be delayed, incomplete, unavailable, or affected by source format changes.</p>
        </div>
      </section>
      <Disclaimer />
    </div>
  );
}
