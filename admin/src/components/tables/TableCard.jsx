import { motion } from "framer-motion";
import {
  QrCode,
  MoreVertical,
  Users,
  ShoppingBag,
} from "lucide-react";

const statusStyles = {
  AVAILABLE: "bg-green-50 text-green-600",
  OCCUPIED: "bg-orange-50 text-orange-600",
  RESERVED: "bg-blue-50 text-blue-600",
};

export default function TableCard({
  table,
  onGenerateQR,
}) {
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
        y: -4,
      }}
      className="relative overflow-hidden rounded-3xl border border-orange-100 bg-white p-5 shadow-sm"
    >
      {/* Top */}

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-xl">
              🪑
            </div>

            <div>
              <p className="text-xs text-gray-400">
                TABLE
              </p>

              <h2 className="text-xl font-bold text-gray-900">
                {table.number}
              </h2>
            </div>
          </div>
        </div>

        <button className="rounded-xl p-2 text-gray-400 transition hover:bg-orange-50">
          <MoreVertical size={18} />
        </button>
      </div>

      {/* Status */}

      <div className="mt-5 flex items-center justify-between">
        <span
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
            statusStyles[table.status]
          }`}
        >
          {table.status}
        </span>

        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Users size={14} />

          {table.capacity} seats
        </div>
      </div>

      {/* Current order */}

      {table.status === "OCCUPIED" && (
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-orange-50 p-3">
          <div className="flex items-center gap-2">
            <ShoppingBag
              size={16}
              className="text-[#e86a33]"
            />

            <span className="text-xs font-medium text-gray-600">
              Order #{table.orderNumber}
            </span>
          </div>

          <span className="text-xs font-bold text-[#e86a33]">
            ₹{table.orderTotal}
          </span>
        </div>
      )}

      {/* QR */}

      <motion.button
        whileTap={{
          scale: 0.97,
        }}
        onClick={() => onGenerateQR(table)}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-white py-3 text-sm font-semibold text-[#e86a33] transition hover:bg-orange-50"
      >
        <QrCode size={17} />

        Generate QR
      </motion.button>
    </motion.div>
  );
}