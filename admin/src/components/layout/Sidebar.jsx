import { motion } from "framer-motion";
import {
  useEffect,
  useState,
} from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Armchair,
  Settings,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const menuItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    label: "Orders",
    icon: ShoppingBag,
    path: "/orders",
  },
  {
    label: "Menu",
    icon: UtensilsCrossed,
    path: "/menu",
  },
  {
    label: "Tables",
    icon: Armchair,
    path: "/tables",
  },
  {
    label: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

const ACCEPTING_ORDERS_KEY =
  "accepting-orders";

const readAcceptingOrders = () => {
  const storedValue = localStorage.getItem(
    ACCEPTING_ORDERS_KEY
  );

  if (storedValue === null) {
    return true;
  }

  return storedValue === "true";
};

export default function Sidebar({
  open,
  onClose,
}) {
  const [acceptingOrders, setAcceptingOrders] =
    useState(readAcceptingOrders);

  useEffect(() => {
    const onAcceptingOrdersChanged = (event) => {
      setAcceptingOrders(
        Boolean(event.detail)
      );
    };

    window.addEventListener(
      "accepting-orders-changed",
      onAcceptingOrdersChanged
    );

    return () => {
      window.removeEventListener(
        "accepting-orders-changed",
        onAcceptingOrdersChanged
      );
    };
  }, []);

  return (
    <>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{
          duration: 0.35,
          ease: "easeOut",
        }}
        className={`
          fixed left-0 top-0 z-50
          flex h-screen w-64 flex-col
          border-r border-orange-100
          bg-[#fffaf5]
          px-5 py-6
          lg:translate-x-0
          ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Logo */}

        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e86a33] text-xl shadow-sm">
              🍽️
            </div>

            <div>
              <h1 className="font-bold text-gray-900">
                DineFlow
              </h1>

              <p className="text-xs text-gray-400">
                Restaurant
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-gray-500 hover:bg-orange-50 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}

        <nav className="flex flex-1 flex-col gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
              >
                {({ isActive }) => (
                  <motion.div
                    whileHover={{ x: 4 }}
                    whileTap={{
                      scale: 0.98,
                    }}
                    className={`
                      flex items-center gap-3
                      rounded-2xl px-4 py-3
                      text-sm font-medium
                      transition
                      ${
                        isActive
                          ? "bg-[#e86a33] text-white shadow-md shadow-orange-200"
                          : "text-gray-600 hover:bg-orange-50 hover:text-[#e86a33]"
                      }
                    `}
                  >
                    <Icon size={19} />

                    <span>
                      {item.label}
                    </span>
                  </motion.div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Restaurant status */}

        <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                acceptingOrders
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
            />

            <span className="text-sm font-medium text-gray-800">
              {acceptingOrders
                ? "Restaurant Open"
                : "Restaurant Closed"}
            </span>
          </div>

          <p className="mt-1 text-xs text-gray-400">
            {acceptingOrders
              ? "Accepting orders"
              : "Not accepting now"}
          </p>
        </div>
      </motion.aside>
    </>
  );
}