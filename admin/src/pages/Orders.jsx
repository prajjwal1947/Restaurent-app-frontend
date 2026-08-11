import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import OrderFilters from "../components/orders/OrderFilters";
import AdminOrderCard from "../components/orders/AdminOrderCard";

const initialOrders = [
  {
    id: "1",
    orderNumber: 1024,
    table: 12,
    status: "PREPARING",
    total: 849,
    time: "2 min ago",
    items: [
      {
        id: 1,
        quantity: 2,
        name: "Margherita Pizza",
        price: 598,
      },
      {
        id: 2,
        quantity: 1,
        name: "Coke",
        price: 99,
      },
    ],
  },
  {
    id: "2",
    orderNumber: 1023,
    table: 4,
    status: "PENDING",
    total: 599,
    time: "4 min ago",
    items: [
      {
        id: 3,
        quantity: 1,
        name: "Classic Burger",
        price: 399,
      },
      {
        id: 4,
        quantity: 1,
        name: "French Fries",
        price: 200,
      },
    ],
  },
  {
    id: "3",
    orderNumber: 1022,
    table: 8,
    status: "READY",
    total: 749,
    time: "7 min ago",
    items: [
      {
        id: 5,
        quantity: 2,
        name: "Paneer Tikka",
        price: 749,
      },
    ],
  },
];

export default function Orders() {
  const [orders, setOrders] =
    useState(initialOrders);

  const [filter, setFilter] =
    useState("ALL");

  const [search, setSearch] =
    useState("");

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

  const handleStatusChange = (
    orderId,
    status
  ) => {
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status,
            }
          : order
      )
    );
  };

  return (
    <div className="mx-auto max-w-6xl">
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
    </div>
  );
}