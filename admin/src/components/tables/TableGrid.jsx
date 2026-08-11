import { AnimatePresence, motion } from "framer-motion";
import TableCard from "./TableCard";

export default function TableGrid({
  tables,
  onGenerateQR,
}) {
  return (
    <motion.div
      layout
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <AnimatePresence>
        {tables.map((table) => (
          <TableCard
            key={table.id}
            table={table}
            onGenerateQR={onGenerateQR}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}