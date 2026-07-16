import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { BarChart3, Building2, Globe2, Info, LayoutDashboard, Menu, Search, Table2, X } from "lucide-react";
import { useI18n } from "../i18n/I18nContext";
import type { TranslationKey } from "../i18n/messages";

const nav: { to: string; label: TranslationKey; icon: typeof LayoutDashboard }[] = [
  { to: "/", label: "nav.dashboard", icon: LayoutDashboard },
  { to: "/holdings", label: "nav.holdings", icon: Table2 },
  { to: "/trades", label: "nav.trades", icon: BarChart3 },
  { to: "/funds", label: "nav.funds", icon: Building2 },
  { to: "/stock", label: "nav.stock", icon: Search },
  { to: "/about", label: "nav.about", icon: Info },
];

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { locale, setLocale, t } = useI18n();
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
      isActive ? "bg-brand text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
    }`;

  return (
    <div className="min-h-screen overflow-x-hidden bg-wash text-ink">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="hidden text-xs font-semibold uppercase tracking-[0.22em] text-brand sm:block">{t("brand.eyebrow")}</p>
              <h1 className="mt-1 truncate text-xl font-semibold tracking-tight sm:text-2xl">{t("brand.title")}</h1>
            </div>
            <button
              type="button"
              className="inline-flex shrink-0 items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              {t("nav.menu")}
            </button>
            <div className="hidden items-center gap-2 lg:flex">
              <nav aria-label={t("nav.primary")} className="flex flex-wrap gap-2">
                {nav.map(({ to, label, icon: Icon }) => (
                  <NavLink key={to} to={to} className={navClass}>
                    <Icon className="h-4 w-4" />
                    {t(label)}
                  </NavLink>
                ))}
              </nav>
              <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                <Globe2 className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">{t("language.label")}</span>
                <select
                  aria-label={t("language.label")}
                  className="rounded-md border border-slate-300 bg-white px-2 py-2"
                  value={locale}
                  onChange={(event) => setLocale(event.target.value as "en" | "zh-TW")}
                >
                  <option value="en">English</option>
                  <option value="zh-TW">繁體中文</option>
                </select>
              </label>
            </div>
          </div>
          <nav
            id="mobile-navigation"
            aria-label={t("nav.mobile")}
            className={`${menuOpen ? "grid" : "hidden"} mt-4 grid-cols-2 gap-2 border-t border-slate-200 pt-4 lg:hidden`}
          >
            {nav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={navClass}
                onClick={() => setMenuOpen(false)}
              >
                <Icon className="h-4 w-4" />
                {t(label)}
              </NavLink>
            ))}
            <label className="col-span-2 mt-1 flex items-center gap-2 border-t border-slate-200 pt-3 text-sm font-medium text-slate-700">
              <Globe2 className="h-4 w-4" aria-hidden="true" />
              <span>{t("language.label")}</span>
              <select
                className="ml-auto rounded-md border border-slate-300 bg-white px-3 py-2"
                value={locale}
                onChange={(event) => setLocale(event.target.value as "en" | "zh-TW")}
              >
                <option value="en">English</option>
                <option value="zh-TW">繁體中文</option>
              </select>
            </label>
          </nav>
        </div>
      </header>
      <main className="mx-auto min-w-0 max-w-7xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
