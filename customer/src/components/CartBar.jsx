import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ArrowRight } from "lucide-react";

export default function CartBar({ cart, onOpen }) {
  const itemCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.div
          className="cart-bar"
          initial={{
            opacity: 0,
            y: 100,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            y: 100,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
          }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpen}
        >
          <div className="cart-icon">
            <ShoppingBag size={20} />

            <motion.span
              key={itemCount}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="cart-count"
            >
              {itemCount}
            </motion.span>
          </div>

          <div className="cart-info">
            <span>Your Order</span>
            <small>{itemCount} items</small>
          </div>

          <div className="cart-total">
            <strong>₹{total}</strong>

            <ArrowRight size={18} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}