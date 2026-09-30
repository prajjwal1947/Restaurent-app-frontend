import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, Check } from "lucide-react";
import { useState } from "react";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80";

export default function FoodDetails({
  item,
  onClose,
  onAddToCart,
}) {
  const [quantity, setQuantity] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [added, setAdded] = useState(false);

  if (!item) {
    return null;
  }

  const variants = item.variants || [];
  const selectedVariant = variants.find((variant) => variant.id === selectedVariantId);
  const unitPrice = selectedVariant?.price ?? item.price;

  const addOnTotal = selectedAddOns.reduce(
    (total, id) => {
      const addOn = item.addOns?.find((option) => option.id === id);

      return total + (addOn?.price || 0);
    },
    0
  );

  const total = (unitPrice + addOnTotal) * quantity;

  const toggleAddOn = (id) => {
    setSelectedAddOns((current) => {
      if (current.includes(id)) {
        return current.filter((itemId) => itemId !== id);
      }

      return [...current, id];
    });
  };

  const handleAdd = () => {
    if (variants.length > 0 && !selectedVariant) return;
    const selectedOptions = (item.addOns || []).filter((addOn) =>
      selectedAddOns.includes(addOn.id)
    );

    onAddToCart({
      ...item,
      variantId: selectedVariant?.id,
      variantName: selectedVariant?.name,
      price: unitPrice,
      quantity,
      addOns: selectedOptions,
      unitPrice: unitPrice + addOnTotal,
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
                src={item.image || FALLBACK_IMAGE}
                alt={item.name}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = FALLBACK_IMAGE;
                }}
              />
            </motion.div>

            {/* Content */}
            <div className="details-content">
              <div className="details-title-row">
                <div>
                  <h2>{item.name}</h2>

                  <p className="details-price">
                    {variants.length > 0 && !selectedVariant ? "From " : ""}₹{unitPrice}
                  </p>
                </div>
              </div>

              <p className="details-description">
                {item.description}. Carefully prepared
                using fresh ingredients and our
                signature recipe.
              </p>

              <div className="details-divider" />

              {variants.length > 0 && (
                <div className="details-section">
                  <div className="details-section-heading">
                    <span>CHOOSE A SIZE</span>
                    <small>REQUIRED</small>
                  </div>

                  <div className="addon-list" role="radiogroup" aria-label="Choose a size">
                    {variants.map((variant) => {
                      const selected = selectedVariantId === variant.id;
                      return (
                        <button
                          key={variant.id}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          className={`addon ${selected ? "selected" : ""}`}
                          onClick={() => setSelectedVariantId(variant.id)}
                        >
                          <span className="addon-left">
                            <span className={`addon-checkbox rounded-full ${selected ? "checked" : ""}`}>
                              {selected && <Check size={13} />}
                            </span>
                            <span>{variant.name}</span>
                          </span>
                          <span>₹{variant.price}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add-ons */}
              <div className="details-section">
                <div className="details-section-heading">
                  <span>ADD EXTRAS</span>

                  <small>OPTIONAL</small>
                </div>

                <div className="addon-list">
                  {(item.addOns || []).map((addOn) => {
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
                  disabled={variants.length > 0 && !selectedVariant}
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