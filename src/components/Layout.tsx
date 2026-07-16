import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { BarChart3, Building2, Info, LayoutDashboard, Menu, Search, Table2, X } from "lucide-react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/holdings", label: "Holdings", icon: Table2 },
  { to: "/trades", label: "Trades", icon: BarChart3 },
  { to: "/funds", label: "Funds", icon: Building2 },
  { to: "/stock", label: "Stock Detail", icon: Search },
  { to: "/about", label: "About", icon: Info },
];

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
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
              <p className="hidden text-xs font-semibold uppercase tracking-[0.22em] text-brand sm:block">ARK Invest public ETF holdings</p>
              <h1 className="mt-1 truncate text-xl font-semibold tracking-tight sm:text-2xl">Cathie Wood ARK Tracker</h1>
            </div>
            <button
              type="button"
              className="inline-flex shrink-0 items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              Menu
            </button>
            <nav aria-label="Primary navigation" className="hidden flex-wrap gap-2 lg:flex">
              {nav.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} className={navClass}>
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
          <nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
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
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto min-w-0 max-w-7xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
