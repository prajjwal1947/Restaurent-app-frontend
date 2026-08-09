import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, Check } from "lucide-react";
import { useEffect, useState } from "react";

const addOns = [
  {
    id: 1,
    name: "Extra Parmesan",
    price: 40,
  },
  {
    id: 2,
    name: "Truffle Oil",
    price: 60,
  },
  {
    id: 3,
    name: "Garlic Bread",
    price: 80,
  },
];

export default function FoodDetails({
  item,
  onClose,
  onAddToCart,
}) {
  const [quantity, setQuantity] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!item) return;

    setQuantity(1);
    setSelectedAddOns([]);
    setAdded(false);
  }, [item]);

  if (!item) {
    return null;
  }

  const addOnTotal = selectedAddOns.reduce(
    (total, id) => {
      const addOn = addOns.find((item) => item.id === id);

      return total + (addOn?.price || 0);
    },
    0
  );

  const total = (item.price + addOnTotal) * quantity;

  const toggleAddOn = (id) => {
    setSelectedAddOns((current) => {
      if (current.includes(id)) {
        return current.filter((itemId) => itemId !== id);
      }

      return [...current, id];
    });
  };

  const handleAdd = () => {
    const selectedOptions = addOns.filter((addOn) =>
      selectedAddOns.includes(addOn.id)
    );

    onAddToCart({
      ...item,
      quantity,
      addOns: selectedOptions,
      unitPrice: item.price + addOnTotal,
    });

    setAdded(true);

    setTimeout(() => {
      onClose();
    }, 650);
  };

  return (
    <AnimatePresence>
      {item && (
        <>
          {/* Backdrop */}
          <motion.div
            className="food-details-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            className="food-details-sheet"
            initial={{
              y: "100%",
            }}
            animate={{
              y: 0,
            }}
            exit={{
              y: "100%",
            }}
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 30,
            }}
          >
            {/* Handle */}
            <div className="sheet-handle" />

            {/* Close */}
            <button
              className="sheet-close"
              onClick={onClose}
            >
              <X size={20} />
            </button>

            {/* Image */}
            <motion.div
              className="details-image"
              layoutId={`food-${item.id}`}
            >
              <img
                src={item.image}
                alt={item.name}
              />
            </motion.div>

            {/* Content */}
            <div className="details-content">
              <div className="details-title-row">
                <div>
                  <h2>{item.name}</h2>

                  <p className="details-price">
                    ₹{item.price}
                  </p>
                </div>
              </div>

              <p className="details-description">
                {item.description}. Carefully prepared
                using fresh ingredients and our
                signature recipe.
              </p>

              <div className="details-divider" />

              {/* Add-ons */}
              <div className="details-section">
                <div className="details-section-heading">
                  <span>ADD EXTRAS</span>

                  <small>OPTIONAL</small>
                </div>

                <div className="addon-list">
                  {addOns.map((addOn) => {
                    const selected =
                      selectedAddOns.includes(addOn.id);

                    return (
                      <button
                        key={addOn.id}
                        className={`addon ${
                          selected ? "selected" : ""
                        }`}
                        onClick={() =>
                          toggleAddOn(addOn.id)
                        }
                      >
                        <div className="addon-left">
                          <div
                            className={`addon-checkbox ${
                              selected
                                ? "checked"
                                : ""
                            }`}
                          >
                            {selected && (
                              <Check size={13} />
                            )}
                          </div>

                          <span>{addOn.name}</span>
                        </div>

                        <span>
                          + ₹{addOn.price}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom controls */}
              <div className="details-bottom">
                <div className="quantity-control">
                  <button
                    onClick={() =>
                      setQuantity((q) =>
                        Math.max(1, q - 1)
                      )
                    }
                  >
                    <Minus size={16} />
                  </button>

                  <span>{quantity}</span>

                  <button
                    onClick={() =>
                      setQuantity((q) => q + 1)
                    }
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <motion.button
                  className={`details-add-button ${
                    added ? "success" : ""
                  }`}
                  onClick={handleAdd}
                  whileTap={{
                    scale: 0.97,
                  }}
                >
                  {added ? (
                    <>
                      <Check size={18} />
                      Added
                    </>
                  ) : (
                    <>Add to order · ₹{total}</>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}