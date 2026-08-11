import { motion } from "framer-motion";
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  ArrowRight,
} from "lucide-react";

export default function CartDrawer({
  cart,
  onBack,
  onUpdateQuantity,
  onRemove,
  onPlaceOrder,
}) {
  const getItemPrice = (item) =>
    item.unitPrice ?? item.price ?? 0;

  const subtotal = cart.reduce(
    (total, item) =>
      total + getItemPrice(item) * item.quantity,
    0
  );

  const tax = Math.round(subtotal * 0.05);

  const total = subtotal + tax;

  return (
    <main className="app cart-screen">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <header className="cart-screen-header">
          <button
            className="cart-back"
            onClick={onBack}
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <p>TABLE 12</p>
            <h2>Your Order</h2>
          </div>
        </header>

        <section className="cart-items">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <div>🛒</div>
              <h3>Your order is empty</h3>
              <p>
                Add something delicious
                from the menu.
              </p>
            </div>
          ) : (
            cart.map((item, index) => (
              <motion.div
                key={`${item.id}-${index}`}
                className="cart-item"
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.06,
                }}
                layout
              >
                <img
                  src={item.image}
                  alt={item.name}
                />

                <div className="cart-item-content">
                  <div className="cart-item-top">
                    <div>
                      <h3>{item.name}</h3>

                      {item.addOns?.length > 0 && (
                        <p>
                          {item.addOns
                            .map(
                              (addOn) =>
                                addOn.name
                            )
                            .join(" · ")}
                        </p>
                      )}
                    </div>

                    <button
                      className="remove-button"
                      onClick={() =>
                        onRemove(item)
                      }
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="cart-item-bottom">
                    <strong>
                      ₹
                      {getItemPrice(item) *
                        item.quantity}
                    </strong>

                    <div className="mini-quantity">
                      <button
                        onClick={() =>
                          onUpdateQuantity(
                            item,
                            -1
                          )
                        }
                      >
                        <Minus size={13} />
                      </button>

                      <motion.span
                        key={item.quantity}
                        initial={{
                          scale: 1.3,
                        }}
                        animate={{
                          scale: 1,
                        }}
                      >
                        {item.quantity}
                      </motion.span>

                      <button
                        onClick={() =>
                          onUpdateQuantity(
                            item,
                            1
                          )
                        }
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </section>

        {cart.length > 0 && (
          <footer className="cart-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>

            <div className="summary-row">
              <span>Taxes</span>
              <span>₹{tax}</span>
            </div>

            <div className="summary-divider" />

            <div className="summary-total">
              <span>Total</span>
              <strong>₹{total}</strong>
            </div>

            <button
              className="place-order-button"
              onClick={onPlaceOrder}
            >
              <span>
                Send Order to Kitchen
              </span>

              <ArrowRight size={18} />
            </button>
          </footer>
        )}
      </motion.div>
    </main>
  );
}