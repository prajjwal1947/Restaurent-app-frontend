import { motion } from "framer-motion";

import OrderCard from "./OrderCard";

export default function LiveOrders({ orders = [], loading = false }) {
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
        {loading ? (
          <div role="status" className="space-y-3 py-2" aria-label="Loading live orders">
            {[0, 1, 2].map((item) => (
              <div key={item} className="animate-pulse rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="h-4 w-28 rounded bg-gray-100" />
                  <div className="h-5 w-20 rounded-full bg-gray-100" />
                </div>
                <div className="mt-4 h-3 w-3/4 rounded bg-gray-100" />
                <div className="mt-2 h-3 w-1/2 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : orders.length ? orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
          />
        )) : (
          <p className="py-10 text-center text-sm text-gray-500">No live orders right now.</p>
        )}
      </div>
    </div>
  );
}