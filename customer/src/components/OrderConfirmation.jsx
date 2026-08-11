import { motion } from "framer-motion";
import { Check, Utensils, ArrowRight } from "lucide-react";

export default function OrderConfirmation({
  orderNumber,
  total,
  onViewOrder,
}) {
  return (
    <motion.div
      className="order-confirmation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Success circle */}
      <motion.div
        className="success-circle"
        initial={{
          scale: 0,
          rotate: -20,
        }}
        animate={{
          scale: 1,
          rotate: 0,
        }}
        transition={{
          type: "spring",
          stiffness: 220,
          damping: 14,
          delay: 0.15,
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.35,
          }}
        >
          <Check size={38} strokeWidth={2.5} />
        </motion.div>
      </motion.div>

      {/* Text */}
      <motion.div
        className="confirmation-text"
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.4,
        }}
      >
        <p className="confirmation-eyebrow">
          ORDER RECEIVED
        </p>

        <h1>
          Your order
          <br />
          is on its way!
        </h1>

        <p>
          The kitchen has received your order
          and will start preparing it shortly.
        </p>
      </motion.div>

      {/* Order information */}
      <motion.div
        className="order-info-card"
        initial={{
          opacity: 0,
          y: 25,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.55,
        }}
      >
        <div>
          <span>ORDER NUMBER</span>
          <strong>#{orderNumber}</strong>
        </div>

        <div>
          <span>TOTAL</span>
          <strong>₹{total}</strong>
        </div>
      </motion.div>

      {/* Kitchen animation */}
      <motion.div
        className="kitchen-animation"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <motion.div
          animate={{
            y: [0, -7, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut",
          }}
        >
          <Utensils size={25} />
        </motion.div>

        <span>
          The kitchen is preparing your food
        </span>
      </motion.div>

      {/* Button */}
      <motion.button
        className="view-order-button"
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.8,
        }}
        onClick={onViewOrder}
        whileTap={{
          scale: 0.97,
        }}
      >
        <span>Track my order</span>

        <ArrowRight size={18} />
      </motion.button>
    </motion.div>
  );
}