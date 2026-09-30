import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import OrderFilters from "../components/orders/OrderFilters";
import AdminOrderCard from "../components/orders/AdminOrderCard";
import BillModal from "../components/orders/BillModal";
import { adminApi } from "../services/api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [billingOrder, setBillingOrder] = useState(null);
  const [restaurant, setRestaurant] = useState(null);

  const loadOrders = useCallback(() => {
    const params = new URLSearchParams({ page: "1", pageSize: "100" });
    if (filter !== "ALL") params.set("status", filter);
    if (search) params.set("search", search);
    return adminApi.orders(params.toString())
      .then((result) => setOrders((result || []).map(normalizeOrder)))
      .catch((requestError) => setError(requestError.message));
  }, [filter, search]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    adminApi.restaurant()
      .then(setRestaurant)
      .catch((requestError) => setError(requestError.message));
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        filter === "ALL" ||
        order.status === filter;

      const searchValue =
        `${order.orderNumber} ${order.table}`.toLowerCase();

      const matchesSearch =
        searchValue.includes(
          search.toLowerCase()
        );

      return (
        matchesStatus &&
        matchesSearch
      );
    });
  }, [orders, filter, search]);

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
          Manage and track all restaurant
          orders.
        </p>
      </motion.div>

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
      >
        <AnimatePresence mode="popLayout">
          {filteredOrders.map((order) => (
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

        {filteredOrders.length === 0 && (
          <div className="rounded-3xl border border-orange-100 bg-white p-12 text-center">
            <p className="text-gray-500">
              No orders found.
            </p>
          </div>
        )}
      </motion.div>

      {billingOrder && (
        <BillModal
          key={billingOrder.id}
          order={billingOrder}
          restaurant={restaurant}
          onClose={() => setBillingOrder(null)}
        />
      )}
    </div>
  );
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