import { motion } from "framer-motion";
import { Clock3 } from "lucide-react";

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

export default function OrderCard({
  order,
}) {
  const statusClass =
    statusStyles[order.status] ||
    statusStyles.PENDING;

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
      whileHover={{
        y: -2,
      }}
      className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">
              #{order.orderNumber}
            </span>

            <span className="rounded-full bg-orange-50 px-2 py-1 text-xs text-[#e86a33]">
              Table {order.table}
            </span>
          </div>

          <div className="mt-3 space-y-1">
            {order.items.map((item) => (
              <p
                key={item.id}
                className="text-sm text-gray-500"
              >
                {item.quantity} × {item.name}
              </p>
            ))}
          </div>
        </div>

        <div className="text-right">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}
          >
            {order.status}
          </span>

          <p className="mt-3 font-semibold text-gray-900">
            ₹{order.total}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3 text-xs text-gray-400">
        <Clock3 size={14} />

        {order.time}
      </div>
    </motion.div>
  );
}