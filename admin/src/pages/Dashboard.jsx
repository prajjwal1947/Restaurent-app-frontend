import {
  ShoppingBag,
  Clock3,
  ChefHat,
  IndianRupee,
} from "lucide-react";
import { motion } from "framer-motion";

import StatCard from "../components/dashboard/StatCard";
import LiveOrders from "../components/dashboard/LiveOrders";
import AnalyticsAssistant from "../components/dashboard/AnalyticsAssistant";
import { adminApi } from "../services/api";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [summary, setSummary] = useState({});
  const [liveOrders, setLiveOrders] = useState([]);
  const [sales, setSales] = useState([]);
  const [productAnalytics, setProductAnalytics] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminApi.dashboard(), adminApi.productAnalytics()])
      .then(([[summaryResult, salesResult, ordersResult], analyticsResult]) => {
        setSummary(summaryResult || {});
        setSales(salesResult || []);
        setLiveOrders((ordersResult || []).map(normalizeOrder));
        setProductAnalytics(analyticsResult);
        setSelectedMonth(analyticsResult?.monthlySales?.at(-1)?.month || "");
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl">
      {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      {/* Welcome */}
      <motion.div
        initial={{
          opacity: 0,
          y: -10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="mb-8"
      >
        <p className="text-sm text-gray-400">
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </p>

        <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
          Good evening 👋
        </h1>

        <p className="mt-1 text-gray-500">
          Here's what's happening at your
          restaurant today.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Today's Orders"
          value={summary.todayOrderCount ?? 0}
          subtitle="Orders created today"
          icon={<ShoppingBag size={21} />}
          loading={loading}
        />

        <StatCard
          title="Pending Orders"
          value={summary.pendingOrders ?? 0}
          subtitle="Need attention"
          icon={<Clock3 size={21} />}
          loading={loading}
        />

        <StatCard
          title="Preparing"
          value={summary.preparingOrders ?? 0}
          subtitle="In kitchen"
          icon={<ChefHat size={21} />}
          loading={loading}
        />

        <StatCard
          title="Today's Revenue"
          value={`₹${Math.round((summary.todaySalesMinor || 0) / 100)}`}
          subtitle="Non-cancelled orders"
          icon={<IndianRupee size={21} />}
          loading={loading}
        />
      </div>

      {/* Content */}
      <div className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
          <LiveOrders orders={liveOrders} loading={loading} />
        </div>

        <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
          <div>
            <h3 className="font-semibold text-gray-900">
              Today's Sales
            </h3>

            <p className="text-sm text-gray-400">
              Revenue overview
            </p>
          </div>

          <div className="mt-6 flex h-64 items-end gap-3" aria-busy={loading} aria-live="polite">
            {loading ? (
              <div role="status" className="flex h-full w-full items-center justify-center gap-2 text-sm text-gray-500">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-orange-200 border-t-[#e86a33]" />
                Loading sales...
              </div>
            ) : sales.length ? sales.slice(-7).map((entry, index, entries) => {
              const max = Math.max(...entries.map((item) => item.totalMinor || 0), 1);
              const height = Math.max(((entry.totalMinor || 0) / max) * 100, 2);
              return (
                <motion.div
                  key={entry.date || index}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: index * 0.08, duration: 0.5 }}
                  title={`${entry.date || "Day"}: ₹${Math.round((entry.totalMinor || 0) / 100)}`}
                  className="flex-1 rounded-t-xl bg-[#f7c59f]"
                />
              );
            }) : (
              <p className="w-full pb-20 text-center text-sm text-gray-500">No sales recorded in this period.</p>
            )}
          </div>

          {!loading && sales.length > 0 && <div className="mt-3 flex justify-between text-xs text-gray-400">
            {sales.slice(-7).map((entry) => <span key={entry.date}>{new Date(`${entry.date}T12:00:00`).toLocaleDateString(undefined, { weekday: "short" })}</span>)}
          </div>}
        </div>
      </div>

      <AnalyticsAssistant />

      <section className="mt-8" aria-labelledby="product-analytics-heading">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="product-analytics-heading" className="mt-1 text-2xl font-bold text-gray-900">Monthly product history</h2>
          </div>
          <p className="text-xs text-gray-500">Based on non-cancelled orders · last 6 months</p>
        </div>

        <div className="grid gap-5">
          <section className="min-w-0 rounded-2xl border border-orange-100 bg-white p-5 shadow-sm" aria-labelledby="monthly-sales-heading">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 id="monthly-sales-heading" className="font-semibold text-gray-900">Product sales by month</h3>
                <p className="text-xs text-gray-500">Units sold per product</p>
              </div>
              <select
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                disabled={loading || !(productAnalytics?.monthlySales || []).length}
                aria-label="Select sales month"
                className="rounded-lg border border-orange-100 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#e86a33]"
              >
                {(productAnalytics?.monthlySales || []).map((month) => (
                  <option key={month.month} value={month.month}>
                    {new Date(`${month.month}-01T12:00:00`).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[340px] text-left text-sm">
                <thead className="border-b border-orange-100 text-xs text-gray-500">
                  <tr><th className="pb-2 font-medium">Product</th><th className="pb-2 text-right font-medium">Units</th><th className="pb-2 text-right font-medium">Sales</th></tr>
                </thead>
                <tbody className="divide-y divide-orange-50">
                  {!loading && (productAnalytics?.monthlySales?.find((month) => month.month === selectedMonth)?.products || []).map((product, index) => (
                    <tr key={`${product.name}-${index}`}>
                      <td className="max-w-[180px] truncate py-3 font-medium text-gray-700">{product.name}</td>
                      <td className="py-3 text-right text-gray-600">{product.quantity}</td>
                      <td className="py-3 text-right text-gray-600">₹{Math.round(product.revenueMinor / 100)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {loading ? (
                <div role="status" className="flex items-center justify-center gap-2 py-8 text-sm text-gray-500">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-orange-200 border-t-[#e86a33]" />
                  Loading product sales...
                </div>
              ) : !(productAnalytics?.monthlySales?.find((month) => month.month === selectedMonth)?.products || []).length ? (
                <p className="py-8 text-center text-sm text-gray-500">No product sales recorded for this month.</p>
              ) : null}
            </div>
          </section>

        </div>
      </section>

    </div>
  );
}

function normalizeOrder(order) {
  return {
    ...order,
    table: order.table?.number || order.tableNumber || order.table || "-",
    total: Math.round((order.totalMinor || 0) / 100),
    time: new Date(order.placedAt || order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}