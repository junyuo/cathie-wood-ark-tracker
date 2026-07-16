import Disclaimer from "../components/Disclaimer";
import { useI18n } from "../i18n/I18nContext";
import type { TranslationKey } from "../i18n/messages";

const paragraphs: TranslationKey[] = ["about.p1", "about.p2", "about.p3", "about.p4", "about.p5"];

export default function About() {
  const { t } = useI18n();
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">{t("about.title")}</h2>
        <p className="text-sm text-muted">{t("about.description")}</p>
      </div>
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="space-y-4 text-sm leading-6 text-slate-700">
          {paragraphs.map((key) => <p key={key}>{t(key)}</p>)}
        </div>
      </section>
      <Disclaimer />
    </div>
  );
}
