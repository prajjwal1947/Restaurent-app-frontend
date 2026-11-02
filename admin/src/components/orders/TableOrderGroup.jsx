import { motion } from "framer-motion";
import { ChefHat, Check, Clock3, ReceiptText } from "lucide-react";

const statusStyles = {
  PENDING: "bg-yellow-50 text-yellow-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  PREPARING: "bg-orange-50 text-orange-700",
  READY: "bg-green-50 text-green-700",
  SERVED: "bg-gray-100 text-gray-600",
  CANCELLED: "bg-red-50 text-red-600",
};

const NEXT_STATUS = {
  PENDING: "CONFIRMED",
  CONFIRMED: "PREPARING",
  PREPARING: "READY",
  READY: "SERVED",
};

export default function TableOrderGroup({ table, orders, onStatusChange, onGenerateBill }) {
  const live = orders.filter((order) => order.status !== "CANCELLED");
  const totalMinor = live.reduce((sum, order) => sum + (order.totalMinor || 0), 0);
  const inProgress = live.filter((order) => order.status !== "SERVED").length;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-gray-900">Table {table}</h3>
            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-[#e86a33]">
              {live.length} {live.length === 1 ? "order" : "orders"}
            </span>
            {inProgress > 0 ? (
              <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">
                {inProgress} in progress
              </span>
            ) : (
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                Ready to bill
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 sm:flex-col sm:items-end">
          <p className="text-xl font-bold text-gray-900">₹{Math.round(totalMinor / 100)}</p>
          <button
            type="button"
            onClick={onGenerateBill}
            className="flex items-center gap-2 rounded-xl bg-[#e86a33] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#d85d29]"
          >
            <ReceiptText size={15} />
            Generate table bill
          </button>
        </div>
      </div>

      <div className="mt-4 divide-y divide-orange-50 rounded-2xl border border-orange-50">
        {orders.map((order) => {
          const next = NEXT_STATUS[order.status];
          return (
            <div key={order.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-gray-900">#{order.orderNumber}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[order.status] || ""}`}>
                    {order.status}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock3 size={13} />
                    {order.time}
                  </span>
                </div>
                <div className="mt-2 space-y-1">
                  {order.items.map((item) => (
                    <p key={item.id} className="text-sm text-gray-600">
                      {item.quantity} × {item.name}
                      {item.variantName && <span className="text-gray-400"> · {item.variantName}</span>}
                    </p>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                <p className="text-sm font-semibold text-gray-700">₹{order.total}</p>
                {next && (
                  <button
                    type="button"
                    onClick={() => onStatusChange(order.id, next)}
                    className="flex items-center gap-2 rounded-xl border border-orange-200 bg-white px-3 py-2 text-xs font-semibold text-[#b9572b] transition hover:bg-orange-50"
                  >
                    {next === "PREPARING" ? <ChefHat size={14} /> : <Check size={14} />}
                    Mark {next}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
