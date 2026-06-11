import { NavLink, Outlet } from "react-router-dom";
import { BarChart3, Building2, Info, LayoutDashboard, LineChart, Search, Table2 } from "lucide-react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/holdings", label: "Holdings", icon: Table2 },
  { to: "/trades", label: "Trades", icon: BarChart3 },
  { to: "/funds", label: "Funds", icon: Building2 },
  { to: "/stock", label: "Stock Detail", icon: Search },
  { to: "/performance", label: "Performance", icon: LineChart },
  { to: "/about", label: "About", icon: Info },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-wash text-ink">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">ARK Invest public ETF holdings</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Cathie Wood ARK Tracker</h1>
          </div>
          <nav className="flex flex-wrap gap-2">
            {nav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                    isActive ? "bg-brand text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
