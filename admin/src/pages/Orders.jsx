import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import OrderFilters from "../components/orders/OrderFilters";
import AdminOrderCard from "../components/orders/AdminOrderCard";
import TableOrderGroup from "../components/orders/TableOrderGroup";
import BillModal from "../components/orders/BillModal";
import MarketplaceOrdersComingSoon from "../components/orders/MarketplaceOrdersComingSoon";
import { adminApi } from "../services/api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [billingOrder, setBillingOrder] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [activeTab, setActiveTab] = useState("restaurant");
  const latestRequest = useRef(0);
  const loading = !loaded;

  // Filtering happens in the browser so a table's bill always covers all of its orders.
  const loadOrders = useCallback(() => {
    const requestId = ++latestRequest.current;
    return adminApi.orders("page=1&pageSize=100")
      .then((result) => {
        if (requestId !== latestRequest.current) return;
        setOrders((result || []).map(normalizeOrder));
        setError("");
      })
      .catch((requestError) => {
        if (requestId === latestRequest.current) setError(requestError.message);
      })
      .finally(() => {
        if (requestId === latestRequest.current) setLoaded(true);
      });
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    adminApi.restaurant()
      .then(setRestaurant)
      .catch((requestError) => setError(requestError.message));
  }, []);

  const { tableGroups, billedOrders } = useMemo(() => {
    const matches = (order) =>
      (filter === "ALL" || order.status === filter) &&
      `${order.orderNumber} ${order.table}`.toLowerCase().includes(search.toLowerCase());

    const open = new Map();
    const billed = [];
    for (const order of orders) {
      if (order.billedAt) {
        if (matches(order)) billed.push(order);
        continue;
      }
      const key = order.tableId || order.table;
      if (!open.has(key)) open.set(key, []);
      open.get(key).push(order);
    }

    const when = (order) => new Date(order.placedAt || order.createdAt);
    const groups = [];
    for (const [key, list] of open) {
      const sorted = [...list].sort((a, b) => when(a) - when(b));
      // Tables with only cancelled orders have nothing to bill.
      if (sorted.every((order) => order.status === "CANCELLED")) {
        billed.push(...sorted.filter(matches));
        continue;
      }
      if (sorted.some(matches)) {
        groups.push({ key, table: sorted[0].table, tableId: sorted[0].tableId, orders: sorted });
      }
    }
    groups.sort((a, b) => when(b.orders.at(-1)) - when(a.orders.at(-1)));
    billed.sort((a, b) => when(b) - when(a));
    return { tableGroups: groups, billedOrders: billed };
  }, [orders, filter, search]);

  const closeTable = async (tableId) => {
    await adminApi.closeTableBill(tableId);
    setBillingOrder(null);
    await loadOrders();
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await adminApi.setOrderStatus(orderId, status);
      await loadOrders();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      <motion.div
        initial={{
          opacity: 0,
          y: -10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
      >
        <p className="text-sm text-gray-400">
          Restaurant management
        </p>

        <h1 className="mt-1 text-3xl font-bold text-gray-900">
          Orders
        </h1>

        <p className="mt-1 text-gray-500">
          Manage and track all restaurant and marketplace orders.
        </p>
      </motion.div>

      {/* Tab Navigation */}
      <div className="mt-8 flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("restaurant")}
          className={`py-3 px-4 font-semibold border-b-2 transition-colors ${
            activeTab === "restaurant"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Restaurant Orders
        </button>
        <button
          onClick={() => setActiveTab("marketplace")}
          className={`py-3 px-4 font-semibold border-b-2 transition-colors ${
            activeTab === "marketplace"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Marketplace Orders (Swiggy, Zomato)
        </button>
      </div>

      {/* Restaurant Orders Tab */}
      {activeTab === "restaurant" && (
        <>
          <div className="mt-8">
            <OrderFilters
              activeFilter={filter}
              setActiveFilter={setFilter}
              search={search}
              setSearch={setSearch}
            />
          </div>

          <motion.div
            layout
            className="mt-6 space-y-4"
            aria-busy={loading}
          >
            {loading && <p role="status" className="py-12 text-center text-gray-500">Loading orders...</p>}
            <AnimatePresence mode="popLayout">
              {!loading && tableGroups.map((group) => (
                <TableOrderGroup
                  key={group.key}
                  table={group.table}
                  orders={group.orders}
                  onStatusChange={handleStatusChange}
                  onGenerateBill={() => setBillingOrder(mergeTableOrders(group))}
                />
              ))}
            </AnimatePresence>

            {!loading && billedOrders.length > 0 && (
              <h2 className="pt-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
                Billed orders
              </h2>
            )}
            <AnimatePresence mode="popLayout">
              {!loading && billedOrders.map((order) => (
                <AdminOrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={
                    handleStatusChange
                  }
                  onGenerateBill={setBillingOrder}
                />
              ))}
            </AnimatePresence>

            {!loading && !error && tableGroups.length === 0 && billedOrders.length === 0 && (
              <div className="rounded-3xl border border-orange-100 bg-white p-12 text-center">
                <p className="text-gray-500">
                  No orders found.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* Marketplace Orders Tab */}
      {activeTab === "marketplace" && (
        <div className="mt-8">
          <MarketplaceOrdersComingSoon />
        </div>
      )}

      {billingOrder && (
        <BillModal
          key={billingOrder.id}
          order={billingOrder}
          restaurant={restaurant}
          onClose={() => setBillingOrder(null)}
          onCloseTable={billingOrder.tableId && billingOrder.orderNumbers
            ? () => closeTable(billingOrder.tableId)
            : undefined}
          canCloseTable={billingOrder.canClose}
        />
      )}
    </div>
  );
}

// One bill for everything a table has ordered; identical lines are added together.
function mergeTableOrders(group) {
  const live = group.orders.filter((order) => order.status !== "CANCELLED");
  const lines = new Map();
  for (const order of live) {
    for (const item of order.items) {
      const key = [
        item.name,
        item.variantName ?? "",
        item.unitPriceMinor,
        (item.addOns || []).map((addOn) => addOn.name).sort().join("+"),
      ].join("|");
      const line = lines.get(key);
      if (line) {
        line.quantity += item.quantity;
        line.lineTotalMinor += item.lineTotalMinor || 0;
      } else {
        lines.set(key, { ...item, id: key, lineTotalMinor: item.lineTotalMinor || 0 });
      }
    }
  }
  const sum = (field) => live.reduce((total, order) => total + (order[field] || 0), 0);
  const numbers = live.map((order) => order.orderNumber).sort((a, b) => a - b);
  const allServed = live.every((order) => order.status === "SERVED");
  return {
    id: `table-${group.key}`,
    tableId: group.tableId,
    table: group.table,
    orderNumber: numbers[0],
    orderNumbers: numbers,
    status: allServed ? "SERVED" : "IN PROGRESS",
    canClose: group.orders.every((order) => order.status === "SERVED" || order.status === "CANCELLED"),
    placedAt: live[0].placedAt || live[0].createdAt,
    subtotalMinor: sum("subtotalMinor"),
    taxMinor: sum("taxMinor"),
    discountMinor: sum("discountMinor"),
    totalMinor: sum("totalMinor"),
    items: [...lines.values()].map((line) => ({ ...line, lineTotal: line.lineTotalMinor / 100 })),
  };
}

function normalizeOrder(order) {
  return {
    ...order,
    table: order.table?.number || order.tableNumber || order.table || "-",
    total: Math.round((order.totalMinor || 0) / 100),
    time: new Date(order.placedAt || order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    items: (order.items || []).map((item) => ({
      ...item,
      name: item.nameSnapshot || item.name,
      variantName: item.variantNameSnapshot,
      lineTotal: Math.round((item.lineTotalMinor || 0) / 100),
      unitPrice: Math.round((item.unitPriceMinor || 0) / 100),
      addOns: (item.addOns || []).map((addOn) => ({
        ...addOn,
        name: addOn.nameSnapshot || addOn.name,
        price: Math.round((addOn.priceMinor || 0) / 100),
      })),
      price: Math.round((item.lineTotalMinor ?? item.priceMinor ?? item.price ?? 0) / (item.lineTotalMinor ? 100 : 1)),
    })),
  };
}