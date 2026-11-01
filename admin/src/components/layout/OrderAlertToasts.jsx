import { AnimatePresence, motion } from "framer-motion";
import { BellRing, Hand, Receipt, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ICONS = {
  order: { Icon: BellRing, tint: "bg-[#e86a33]" },
  bill: { Icon: Receipt, tint: "bg-emerald-600" },
  waiter: { Icon: Hand, tint: "bg-sky-600" },
};

export default function OrderAlertToasts({ alerts, onDismiss }) {
  const navigate = useNavigate();

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-40 flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2">
      <AnimatePresence>
        {alerts.map((alert) => {
          const { Icon, tint } = ICONS[alert.kind] || ICONS.order;
          return (
          <motion.div
            key={alert.id}
            layout
            role="alert"
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40 }}
            className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-orange-200 bg-white p-4 shadow-lg shadow-orange-100"
          >
            <span className={`mt-0.5 rounded-full p-2 text-white ${tint}`}>
              <Icon size={16} />
            </span>
            <button
              type="button"
              onClick={() => {
                onDismiss(alert.id);
                if (alert.kind === "order") navigate("/orders");
              }}
              className="min-w-0 flex-1 text-left"
            >
              <p className="text-sm font-semibold text-gray-900">
                {alert.title} · {alert.detail}
              </p>
              <p className="text-xs text-gray-500">
                {alert.kind === "order" ? "Tap to view orders" : "Mark it done from the bell menu"}
              </p>
              {alert.audioBlocked && (
                <p className="mt-1 text-xs text-[#b9572b]">Click anywhere on the page once to enable sound.</p>
              )}
            </button>
            <button
              type="button"
              onClick={() => onDismiss(alert.id)}
              aria-label="Dismiss"
              className="rounded-lg p-1 text-gray-400 hover:bg-orange-50"
            >
              <X size={16} />
            </button>
          </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
