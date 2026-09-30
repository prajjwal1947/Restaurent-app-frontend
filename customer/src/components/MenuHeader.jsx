import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ClipboardList, Menu, X } from "lucide-react";

export default function MenuHeader({
  restaurantName,
  tableNumber,
  orderCount,
  onOpenOrderHistory,
  categories,
  selectedCategory,
  onCategoryChange,
  latestOrder,
  onTrackOrder,
}) {
  const [navigationOpen, setNavigationOpen] = useState(false);

  return (
    <>
      <header className="menu-header">
        <button
          type="button"
          className="icon-button"
          onClick={() => setNavigationOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={navigationOpen}
        >
          <Menu size={21} />
        </button>

        <div className="restaurant-title">
          <h2>{restaurantName}</h2>

          <span>TABLE {tableNumber}</span>
        </div>

        <button
          type="button"
          className="icon-button"
          onClick={onOpenOrderHistory}
          aria-label={`Order history${orderCount ? `, ${orderCount} orders` : ""}`}
          title="Order history"
        >
          <ClipboardList size={20} />
        </button>
      </header>

      <AnimatePresence>
        {navigationOpen && (
          <div className="customer-nav-overlay">
            <motion.button
              type="button"
              className="customer-nav-backdrop"
              aria-label="Close navigation menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setNavigationOpen(false)}
            />
            <motion.nav
              className="customer-nav-panel"
              aria-label="Customer navigation"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
            >
              <div className="customer-nav-heading">
                <div>
                  <p>TABLE {tableNumber}</p>
                  <h2>{restaurantName}</h2>
                </div>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => setNavigationOpen(false)}
                  aria-label="Close navigation menu"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="customer-nav-label">BROWSE MENU</p>
              <div className="customer-nav-categories">
                {categories.map((category) => (
                  <button
                    type="button"
                    key={category}
                    className={selectedCategory === category ? "active" : ""}
                    aria-current={selectedCategory === category ? "page" : undefined}
                    onClick={() => {
                      onCategoryChange(category);
                      setNavigationOpen(false);
                    }}
                  >
                    {category}
                    <ArrowRight size={15} />
                  </button>
                ))}
              </div>

              <div className="customer-nav-divider" />
              <button
                type="button"
                className="customer-nav-action"
                onClick={() => {
                  setNavigationOpen(false);
                  onOpenOrderHistory();
                }}
              >
                <ClipboardList size={18} />
                <span>Order history</span>
                {orderCount > 0 && <small>{orderCount}</small>}
              </button>
              {latestOrder && (
                <button
                  type="button"
                  className="customer-nav-action"
                  onClick={() => {
                    setNavigationOpen(false);
                    onTrackOrder(latestOrder);
                  }}
                >
                  <span>Track order #{latestOrder.orderNumber}</span>
                  <ArrowRight size={16} />
                </button>
              )}
            </motion.nav>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}