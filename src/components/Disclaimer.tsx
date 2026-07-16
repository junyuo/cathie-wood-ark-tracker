import { useI18n } from "../i18n/I18nContext";

export default function Disclaimer() {
  const { t } = useI18n();
  return (
    <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <p className="font-semibold">{t("disclaimer.title")}</p>
      <p className="mt-1">{t("disclaimer.body")}</p>
    </section>
  );
}
