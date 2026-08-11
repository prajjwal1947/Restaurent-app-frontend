import { motion } from "framer-motion";

import OrderCard from "./OrderCard";

const orders = [
  {
    id: 1,
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
      },
      {
        id: 2,
        quantity: 1,
        name: "Coke",
      },
    ],
  },
  {
    id: 2,
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
      },
      {
        id: 4,
        quantity: 1,
        name: "French Fries",
      },
    ],
  },
  {
    id: 3,
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
      },
    ],
  },
];

export default function LiveOrders() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">
            Live Orders
          </h3>

          <p className="text-sm text-gray-400">
            Orders happening right now
          </p>
        </div>

        <motion.span
          animate={{
            scale: [1, 1.08, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
          }}
          className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-600"
        >
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Live
        </motion.span>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
          />
        ))}
      </div>
    </div>
  );
}