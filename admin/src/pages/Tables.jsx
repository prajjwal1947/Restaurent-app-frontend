import { motion } from "framer-motion";
import {
  Plus,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import TableGrid from "../components/tables/TableGrid";
import QRCodeModal from "../components/tables/QRCodeModal";
import AddTableModal from "../components/tables/AddTableModal";
import { adminApi } from "../services/api";

export default function Tables() {
  const [tables, setTables] = useState([]);
  const [error, setError] = useState("");

  const [search, setSearch] =
    useState("");

  const [selectedTable, setSelectedTable] =
    useState(null);

  const [showAddModal, setShowAddModal] =
    useState(false);

  useEffect(() => {
    const params = search ? `search=${encodeURIComponent(search)}` : "";
    adminApi.tables(params)
      .then((result) => setTables(result || []))
      .catch((requestError) => setError(requestError.message));
  }, [search]);

  const filteredTables = useMemo(() => {
    return tables.filter((table) =>
      String(table.number).includes(
        search
      )
    );
  }, [tables, search]);

  const availableCount =
    tables.filter(
      (table) =>
        table.status === "AVAILABLE"
    ).length;

  const occupiedCount =
    tables.filter(
      (table) =>
        table.status === "OCCUPIED"
    ).length;

  return (
    <>
      <div className="mx-auto max-w-7xl">
        {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
        {/* Header */}

        <motion.div
          initial={{
            opacity: 0,
            y: -10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
        >
          <div>
            <p className="text-sm text-gray-400">
              Restaurant management
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              Tables
            </h1>

            <p className="mt-1 text-gray-500">
              Manage tables and generate QR
              codes.
            </p>
          </div>

          <motion.button
            whileHover={{
              y: -2,
            }}
            whileTap={{
              scale: 0.97,
            }}
            onClick={() =>
              setShowAddModal(true)
            }
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#e86a33] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-orange-100"
          >
            <Plus size={18} />

            Add Table
          </motion.button>
        </motion.div>

        {/* Stats */}

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat
            label="Total Tables"
            value={tables.length}
          />

          <Stat
            label="Available"
            value={availableCount}
          />

          <Stat
            label="Occupied"
            value={occupiedCount}
          />

          <Stat
            label="Reserved"
            value={
              tables.filter(
                (table) =>
                  table.status ===
                  "RESERVED"
              ).length
            }
          />
        </div>

        {/* Search */}

        <div className="relative mt-8 max-w-md">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search table..."
            className="w-full rounded-2xl border border-orange-100 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-[#e86a33]"
          />
        </div>

        {/* Tables */}

        <div className="mt-6">
          <TableGrid
            tables={filteredTables}
            onGenerateQR={
              setSelectedTable
            }
          />
        </div>
      </div>

      {/* QR Modal */}

      <QRCodeModal
        table={selectedTable}
        onClose={() =>
          setSelectedTable(null)
        }
      />

      <AddTableModal
        open={showAddModal}
        onClose={() =>
          setShowAddModal(false)
        }
        onAdd={async (newTable) => {
          try {
            const created = await adminApi.createTable({
              number: newTable.number,
              capacity: newTable.capacity,
            });
            setTables((current) => [...current, created]);
            setShowAddModal(false);
          } catch (requestError) {
            setError(requestError.message);
          }
        }}
      />
    </>
  );
}

function Stat({ label, value }) {
  return (
    <motion.div
      whileHover={{
        y: -2,
      }}
      className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm"
    >
      <p className="text-xs text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-gray-900">
        {value}
      </p>
    </motion.div>
  );
}