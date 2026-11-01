import { AnimatePresence, motion } from "framer-motion";
import { Bell, BellRing, Check, Hand, Receipt, Volume2, VolumeX } from "lucide-react";

const KIND_STYLE = {
  order: { Icon: BellRing, tint: "bg-[#e86a33] text-white" },
  bill: { Icon: Receipt, tint: "bg-emerald-600 text-white" },
  waiter: { Icon: Hand, tint: "bg-sky-600 text-white" },
};

function timeAgo(value) {
  const seconds = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationPanel({
  open,
  items,
  soundEnabled,
  onToggleSound,
  onResolve,
  onSelect,
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.97 }}
          transition={{ duration: 0.15 }}
          className="absolute right-0 top-full z-50 mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-xl shadow-orange-100"
        >
          <div className="flex items-center justify-between border-b border-orange-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">Notifications</p>
              <p className="text-xs text-gray-400">
                {items.length === 0 ? "Nothing needs attention" : `${items.length} need attention`}
              </p>
            </div>
            <button
              type="button"
              onClick={onToggleSound}
              aria-pressed={soundEnabled}
              title={soundEnabled ? "Sound on" : "Sound off"}
              className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-orange-50"
            >
              {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              {soundEnabled ? "Sound on" : "Sound off"}
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <span className="rounded-full bg-orange-50 p-3 text-[#e86a33]">
                  <Bell size={20} />
                </span>
                <p className="text-sm font-semibold text-gray-700">You're all caught up</p>
                <p className="text-xs text-gray-400">
                  New orders, bill requests and waiter calls will show up here.
                </p>
              </div>
            ) : (
              <ul>
                {items.map((item) => {
                  const { Icon, tint } = KIND_STYLE[item.kind];
                  const isOrder = item.kind === "order";
                  return (
                    <li key={item.key} className="flex items-center gap-3 border-b border-orange-50 px-4 py-3 last:border-0">
                      <span className={`rounded-full p-2 ${tint}`}>
                        <Icon size={16} />
                      </span>
                      <button
                        type="button"
                        onClick={() => isOrder && onSelect(item)}
                        className={`min-w-0 flex-1 text-left ${isOrder ? "" : "cursor-default"}`}
                      >
                        <p className="truncate text-sm font-semibold text-gray-900">{item.title}</p>
                        <p className="truncate text-xs text-gray-500">
                          {item.detail} · {timeAgo(item.at)}
                        </p>
                      </button>
                      {isOrder ? (
                        <button
                          type="button"
                          onClick={() => onSelect(item)}
                          className="rounded-lg px-2 py-1 text-xs font-semibold text-[#b9572b] hover:bg-orange-50"
                        >
                          View
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onResolve(item.id)}
                          className="flex items-center gap-1 rounded-lg border border-orange-200 px-2.5 py-1 text-xs font-semibold text-[#b9572b] hover:bg-orange-50"
                        >
                          <Check size={13} /> Done
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
