import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function WelcomeScreen({ tableNumber, onContinue }) {
  return (
    <motion.div
      className="welcome-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="welcome-background" />

      <motion.div
        className="welcome-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          delay: 0.3,
        }}
      >
        <motion.div
          className="restaurant-logo"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 180,
            delay: 0.5,
          }}
        >
          ✦
        </motion.div>

        <motion.p
          className="welcome-small"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          Welcome to
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          OLIVE & THYME
        </motion.h1>

        <motion.div
          className="table-container"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 1.4,
            type: "spring",
            stiffness: 140,
          }}
        >
          <span>TABLE</span>

          <strong>{tableNumber}</strong>
        </motion.div>

        <motion.p
          className="welcome-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        >
          We're happy
          <br />
          to serve you today.
        </motion.p>

        <motion.button
          className="browse-button"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.1 }}
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.02 }}
          onClick={onContinue}
        >
          Browse Menu
          <ArrowRight size={18} />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}