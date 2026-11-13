import { motion } from "framer-motion";
import {
  QrCode,
  MoreVertical,
  Users,
  ShoppingBag,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useState } from "react";

const statusStyles = {
  AVAILABLE: "bg-green-50 text-green-600",
  OCCUPIED: "bg-orange-50 text-orange-600",
  RESERVED: "bg-blue-50 text-blue-600",
};

const statusIcons = {
  AVAILABLE: <CheckCircle size={14} />,
  OCCUPIED: <ShoppingBag size={14} />,
  RESERVED: <Clock size={14} />,
};

export default function TableCard({
  table,
  onGenerateQR,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  const [showMenu, setShowMenu] = useState(false);

  const handleStatusChange = (newStatus) => {
    if (onStatusChange) {
      onStatusChange(table.id, newStatus);
    }
    setShowMenu(false);
  };

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

        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="rounded-xl p-2 text-gray-400 transition hover:bg-orange-50"
          >
            <MoreVertical size={18} />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-gray-200 bg-white shadow-lg z-50"
            >
              <div className="p-2">
                {/* Status Options */}
                <div className="border-b border-gray-100 pb-2 mb-2">
                  <p className="px-3 py-1 text-xs font-semibold text-gray-400">Change Status</p>
                  
                  <button
                    onClick={() => handleStatusChange("AVAILABLE")}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                      table.status === "AVAILABLE"
                        ? "bg-green-50 text-green-600"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <CheckCircle size={14} />
                    Available
                  </button>

                  <button
                    onClick={() => handleStatusChange("OCCUPIED")}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                      table.status === "OCCUPIED"
                        ? "bg-orange-50 text-orange-600"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <ShoppingBag size={14} />
                    Occupied
                  </button>

                  <button
                    onClick={() => handleStatusChange("RESERVED")}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                      table.status === "RESERVED"
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Clock size={14} />
                    Reserved
                  </button>
                </div>

                {/* Edit and Delete */}
                <button
                  onClick={() => {
                    onEdit(table);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition border-b border-gray-100 mb-2"
                >
                  <Edit2 size={14} />
                  Edit Table
                </button>

                <button
                  onClick={() => {
                    onDelete(table.id);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition"
                >
                  <Trash2 size={14} />
                  Delete Table
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Status */}

      <div className="mt-5 flex items-center justify-between">
        <span
          className={`rounded-full px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 ${
            statusStyles[table.status]
          }`}
        >
          {statusIcons[table.status]}
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