import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import Funds from "./pages/Funds";
import Holdings from "./pages/Holdings";
import Performance from "./pages/Performance";
import StockDetail from "./pages/StockDetail";
import Trades from "./pages/Trades";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/holdings" element={<Holdings />} />
        <Route path="/trades" element={<Trades />} />
        <Route path="/funds" element={<Funds />} />
        <Route path="/stock" element={<StockDetail />} />
        <Route path="/stock/:ticker" element={<StockDetail />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/about" element={<About />} />
      </Route>
    </Routes>
  );
}
