import { useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { getPendingRequestCount, subscribeToRequests } from "../services/api";

const BRAND_START = "var(--brand-start, #e86a33)";
const BRAND_END = "var(--brand-end, #f7c59f)";
const RING_MASK = "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px))";

export default function RequestLoader() {
  const pending = useSyncExternalStore(subscribeToRequests, getPendingRequestCount);
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {pending > 0 && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: -16, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          style={{
            position: "fixed", top: 16, left: "50%", x: "-50%", zIndex: 10000,
            display: "flex", alignItems: "center", gap: 12, maxWidth: "calc(100vw - 32px)",
            padding: "8px 20px 8px 8px", borderRadius: 999, pointerEvents: "none",
            background: "#fffaf5e6", color: "#2f2923", fontWeight: 600, fontSize: 14,
            border: `1px solid color-mix(in srgb, ${BRAND_START} 25%, white)`,
            boxShadow: `0 8px 28px color-mix(in srgb, ${BRAND_START} 28%, transparent)`,
            backdropFilter: "blur(8px)",
          }}
        >
          <span style={{ position: "relative", display: "grid", placeItems: "center", width: 44, height: 44 }}>
            <motion.span
              aria-hidden="true"
              animate={reduceMotion ? undefined : { rotate: 360 }}
              transition={{ duration: 1, ease: "linear", repeat: Infinity }}
              style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                background: `conic-gradient(from 0deg, transparent 0deg, ${BRAND_END} 120deg, ${BRAND_START} 330deg, transparent 360deg)`,
                WebkitMask: RING_MASK,
                mask: RING_MASK,
              }}
            />
            <motion.span
              aria-hidden="true"
              animate={reduceMotion ? undefined : { y: [0, -3, 0], rotate: [-6, 6, -6] }}
              transition={{ duration: 0.9, ease: "easeInOut", repeat: Infinity }}
              style={{ fontSize: 22, lineHeight: 1 }}
            >
              👨‍🍳
            </motion.span>
          </span>
          <span>Cooking it up...</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}