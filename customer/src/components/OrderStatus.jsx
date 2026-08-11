import { motion } from "framer-motion";
import { useState } from "react";
import {
  Check,
  ChefHat,
  Utensils,
  Bell,
} from "lucide-react";

const steps = [
  {
    id: "confirmed",
    title: "Order Confirmed",
    description:
      "Your order has been received.",
    icon: Check,
  },
  {
    id: "preparing",
    title: "Preparing",
    description:
      "Our chefs are preparing your food.",
    icon: ChefHat,
  },
  {
    id: "ready",
    title: "Ready",
    description:
      "Your order is ready to be served.",
    icon: Utensils,
  },
  {
    id: "served",
    title: "Served",
    description:
      "Enjoy your meal!",
    icon: Bell,
  },
];


const statusMessages = {
  1: {
    title: "Order confirmed",
    subtitle: "We've received your order",
  },

  2: {
    title: "We're preparing",
    subtitle: "your meal",
  },

  3: {
    title: "Your food is ready",
    subtitle: "We'll serve it shortly",
  },

  4: {
    title: "Enjoy your meal",
    subtitle: "Your order has been served",
  },
};

export default function OrderStatus({
  currentStep = 1,
  orderNumber,
  onBackToMenu,
}) {
  const [waiterCalled, setWaiterCalled] =
    useState(false);

  const currentMessage =
    statusMessages[currentStep] ||
    statusMessages[1];

  const handleCallWaiter = () => {
    setWaiterCalled(true);

    // TODO: Replace local state with a server action.
    // Future WebSocket integration:
    // 1) Ensure socket is connected for this table/session.
    // 2) Emit an event like: "table:call_waiter" with { orderNumber, tableNumber }.
    // 3) Listen for acknowledgment and update UI based on server response.
    // 4) Handle reconnect/retry so the request is not lost if network drops.
  };

  return (
    <div className="order-status">
      <div className="status-header">
        <div>
          <p>ORDER #{orderNumber}</p>

          <motion.h1
            key={currentStep}
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
          >
            {currentMessage.title}
            <br />
            {currentMessage.subtitle}
          </motion.h1>
        </div>

        <motion.div
          className="status-pulse"
          animate={{
            scale: [1, 1.08, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
          }}
        >
          <ChefHat size={24} />
        </motion.div>
      </div>

      <motion.div
        className="estimated-time"
        key={`estimate-${currentStep}`}
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
      >
        <span>ESTIMATED TIME</span>

        <strong>
          {currentStep === 1 && "15–20 min"}

          {currentStep === 2 && "10–15 min"}

          {currentStep === 3 && "Serving now"}

          {currentStep === 4 && "Enjoy!"}
        </strong>
      </motion.div>

      {currentStep === 3 && (
        <motion.div
          className="ready-banner"
          initial={{
            opacity: 0,
            scale: 0.9,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
        >
          <motion.div
            animate={{
              rotate: [0, -8, 8, 0],
            }}
            transition={{
              duration: 0.7,
              repeat: Infinity,
              repeatDelay: 2,
            }}
          >
            🍽️
          </motion.div>

          <div>
            <strong>
              Your order is ready!
            </strong>

            <span>
              Our staff will bring it to your table.
            </span>
          </div>
        </motion.div>
      )}

      <div className="status-timeline">
        {steps.map((step, index) => {
          const Icon = step.icon;

          const completed =
            index < currentStep;

          const active =
            index === currentStep - 1;

          return (
            <motion.div
              className={`status-step ${
                completed ? "completed" : ""
              } ${
                active ? "active" : ""
              }`}
              key={step.id}
              initial={{
                opacity: 0,
                x: -20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: index * 0.15,
              }}
            >
              {index !== steps.length - 1 && (
                <div
                  className={`status-line ${
                    index < currentStep - 1
                      ? "filled"
                      : ""
                  }`}
                />
              )}

              <motion.div
                className="status-icon"
                animate={
                  active
                    ? {
                        scale: [1, 1.08, 1],
                      }
                    : {
                        scale: 1,
                      }
                }
                transition={{
                  repeat: active
                    ? Infinity
                    : 0,
                  duration: 2,
                }}
              >
                {completed ? (
                  <Check size={17} />
                ) : (
                  <Icon size={18} />
                )}
              </motion.div>

              <div className="status-step-content">
                <h3>{step.title}</h3>

                <p>{step.description}</p>

                {active && (
                  <motion.div
                    className="status-progress"
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: "100%",
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                    }}
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="status-bottom">
        <p>
          Need something else?
        </p>

        <div className="status-actions">
          <button
            className={
              waiterCalled ? "called" : ""
            }
            onClick={handleCallWaiter}
          >
            {waiterCalled
              ? "✓ Waiter Called"
              : "Call Waiter"}
          </button>

          <button>
            Request Bill
          </button>
        </div>
      </div>

      <button
        className="back-menu-button"
        onClick={onBackToMenu}
      >
        Continue browsing menu
      </button>
    </div>
  );
}