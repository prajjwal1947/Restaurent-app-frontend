import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";
import MarketplaceOrderCard from "./MarketplaceOrderCard";
import {
  urbanPiperService,
  normalizeUrbanPiperOrder,
  getStatusColor,
} from "../../services/urbanPiperService";

export default function MarketplaceOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [actionInProgress, setActionInProgress] = useState(null);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await urbanPiperService.fetchOrders(1, 100);
      const normalizedOrders = (response.data || response || []).map(
        normalizeUrbanPiperOrder
      );
      setOrders(normalizedOrders);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Failed to load marketplace orders:", err);
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    // Poll every 30 seconds
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  const handleAccept = useCallback(
    async (orderId) => {
      try {
        setActionInProgress(orderId);
        setError("");
        await urbanPiperService.acceptOrder(orderId, 0);
        // Refresh orders after update
        await loadOrders();
      } catch (err) {
        console.error("Failed to accept order:", err);
        setError(err.message || "Failed to accept order");
      } finally {
        setActionInProgress(null);
      }
    },
    [loadOrders]
  );

  const handleMarkReady = useCallback(
    async (orderId) => {
      try {
        setActionInProgress(orderId);
        setError("");
        await urbanPiperService.markOrderReady(orderId);
        await loadOrders();
      } catch (err) {
        console.error("Failed to mark order ready:", err);
        setError(err.message || "Failed to mark order ready");
      } finally {
        setActionInProgress(null);
      }
    },
    [loadOrders]
  );

  const handleDispatch = useCallback(
    async (orderId) => {
      try {
        setActionInProgress(orderId);
        setError("");
        await urbanPiperService.dispatchOrder(orderId);
        await loadOrders();
      } catch (err) {
        console.error("Failed to dispatch order:", err);
        setError(err.message || "Failed to dispatch order");
      } finally {
        setActionInProgress(null);
      }
    },
    [loadOrders]
  );

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (filter === "ALL") return true;
    return order.status === filter;
  });

  // Group by status
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    accepted: orders.filter((o) => o.status === "Acknowledged").length,
    ready: orders.filter((o) => o.status === "Food Ready").length,
    dispatched: orders.filter((o) => o.status === "Dispatched").length,
  };

  const statusFilters = [
    { key: "ALL", label: "All Orders", count: stats.total },
    { key: "pending", label: "Pending", count: stats.pending },
    { key: "Acknowledged", label: "Accepted", count: stats.accepted },
    { key: "Food Ready", label: "Ready", count: stats.ready },
    { key: "Dispatched", label: "Dispatched", count: stats.dispatched },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Marketplace Orders
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Orders from Swiggy, Zomato & other platforms
          </p>
        </div>
        <button
          onClick={loadOrders}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Last Refresh Info */}
      <p className="text-xs text-gray-500">
        Last updated: {lastRefresh.toLocaleTimeString()}
      </p>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-gap-3"
        >
          <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
          <div>
            <h3 className="font-semibold text-red-800">Error</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {statusFilters.map((statusFilter) => (
          <button
            key={statusFilter.key}
            onClick={() => setFilter(statusFilter.key)}
            className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-colors ${
              filter === statusFilter.key
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {statusFilter.label}
            {statusFilter.count > 0 && (
              <span className="ml-2 inline-block bg-opacity-30 bg-white px-2 py-1 rounded-full text-sm">
                {statusFilter.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && orders.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading marketplace orders...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredOrders.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <p className="text-gray-600 mb-2">No orders found</p>
          {orders.length === 0 && (
            <p className="text-sm text-gray-500">
              Marketplace orders from Swiggy and Zomato will appear here
            </p>
          )}
        </div>
      )}

      {/* Orders Grid */}
      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {filteredOrders.map((order) => (
            <MarketplaceOrderCard
              key={order.id}
              order={order}
              onAccept={handleAccept}
              onMarkReady={handleMarkReady}
              onDispatch={handleDispatch}
              isLoading={actionInProgress === order.id}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Summary Stats */}
      {orders.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-gray-200">
          {statusFilters.map((stat) => (
            <div key={stat.key} className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
              <p className="text-xs text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
