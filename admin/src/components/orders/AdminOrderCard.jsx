import { motion } from "framer-motion";
import {
  Clock3,
  Check,
  ChefHat,
} from "lucide-react";

const statusStyles = {
  PENDING:
    "bg-yellow-50 text-yellow-700",
  CONFIRMED:
    "bg-blue-50 text-blue-700",
  PREPARING:
    "bg-orange-50 text-orange-700",
  READY:
    "bg-green-50 text-green-700",
  SERVED:
    "bg-gray-100 text-gray-600",
};

export default function AdminOrderCard({
  order,
  onStatusChange,
}) {
  const nextStatus = {
    PENDING: "CONFIRMED",
    CONFIRMED: "PREPARING",
    PREPARING: "READY",
    READY: "SERVED",
  };

  const next = nextStatus[order.status];

  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        scale: 0.97,
      }}
      whileHover={{
        y: -2,
      }}
      className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-gray-900">
              #{order.orderNumber}
            </h3>

            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-[#e86a33]">
              Table {order.table}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[order.status]}`}
            >
              {order.status}
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between gap-8 text-sm"
              >
                <span className="text-gray-600">
                  {item.quantity} × {item.name}
                </span>

                <span className="text-gray-400">
                  ₹{item.price}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end">
          <p className="text-lg font-bold text-gray-900">
            ₹{order.total}
          </p>

          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock3 size={14} />
            {order.time}
          </div>

          {next && (
            <motion.button
              whileTap={{
                scale: 0.96,
              }}
              onClick={() =>
                onStatusChange(
                  order.id,
                  next
                )
              }
              className="flex items-center gap-2 rounded-xl bg-[#e86a33] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#d85d29]"
            >
              {next === "PREPARING" ? (
                <ChefHat size={15} />
              ) : (
                <Check size={15} />
              )}

              Mark {next}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}