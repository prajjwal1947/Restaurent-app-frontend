import { AnimatePresence, motion } from "framer-motion";
import { X, Armchair, Minus, Plus } from "lucide-react";
import { useState } from "react";

export default function AddTableModal({
  open,
  onClose,
  onAdd,
}) {
  const [capacity, setCapacity] = useState(2);
  const [number, setNumber] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!number) return;

    onAdd({
      number: Number(number),
      capacity,
      status: "AVAILABLE",
    });

    setNumber("");
    setCapacity(2);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.92,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.92,
              y: 20,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-[2rem] bg-[#fffaf5] p-6 shadow-2xl"
          >
            {/* Header */}

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-[#e86a33]">
                  <Armchair size={21} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Add Table
                  </h2>

                  <p className="text-xs text-gray-400">
                    Create a new restaurant table
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="rounded-xl p-2 text-gray-400 transition hover:bg-orange-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-5"
            >
              {/* Table number */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Table Number
                </label>

                <input
                  type="number"
                  min="1"
                  value={number}
                  onChange={(e) =>
                    setNumber(e.target.value)
                  }
                  placeholder="e.g. 12"
                  className="w-full rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#e86a33] focus:ring-4 focus:ring-orange-100"
                />
              </div>

              {/* Capacity */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Seating Capacity
                </label>

                <div className="flex items-center justify-between rounded-2xl border border-orange-100 bg-white p-3">
                  <span className="text-sm text-gray-500">
                    Number of seats
                  </span>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setCapacity(
                          Math.max(1, capacity - 1)
                        )
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#e86a33] transition hover:bg-orange-100"
                    >
                      <Minus size={16} />
                    </button>

                    <span className="w-6 text-center font-bold text-gray-900">
                      {capacity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setCapacity(
                          Math.min(20, capacity + 1)
                        )
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#e86a33] transition hover:bg-orange-100"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Info */}

              <div className="rounded-2xl bg-orange-50 p-4">
                <p className="text-xs leading-5 text-orange-700">
                  A unique QR code will be generated
                  for this table after it is created.
                </p>
              </div>

              {/* Buttons */}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-2xl border border-orange-100 bg-white py-3 text-sm font-semibold text-gray-600 transition hover:bg-orange-50"
                >
                  Cancel
                </button>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="rounded-2xl bg-[#e86a33] py-3 text-sm font-semibold text-white shadow-md shadow-orange-100 transition hover:bg-[#d85d29]"
                >
                  Add Table
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}