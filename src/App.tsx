import { NavLink, Route, Routes } from "react-router-dom";
import { BarChart3, LayoutDashboard, LineChart, ListFilter, Search } from "lucide-react";
import Dashboard from "./pages/Dashboard";
import Holdings from "./pages/Holdings";
import Trades from "./pages/Trades";
import StockDetail from "./pages/StockDetail";
import Performance from "./pages/Performance";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/holdings", label: "Holdings", icon: ListFilter },
  { to: "/trades", label: "Trades", icon: BarChart3 },
  { to: "/stock", label: "Stock Detail", icon: Search },
  { to: "/performance", label: "Performance", icon: LineChart },
];

export default function App() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-moss">ARK Invest ETF public holdings</p>
            <h1 className="text-2xl font-semibold tracking-tight">Cathie Wood ARK Tracker</h1>
          </div>
          <nav className="flex flex-wrap gap-2">
            {nav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                    isActive ? "bg-moss text-white" : "bg-slate-100 text-slate-700 hover:bg-mint"
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
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/holdings" element={<Holdings />} />
          <Route path="/trades" element={<Trades />} />
          <Route path="/stock" element={<StockDetail />} />
          <Route path="/stock/:ticker" element={<StockDetail />} />
          <Route path="/performance" element={<Performance />} />
        </Routes>
      </main>
    </div>
  );
}
