import { motion } from "framer-motion";
import { Plus, Check, Star } from "lucide-react";
import { useState } from "react";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80";

export default function FoodCard({
  item,
  onAdd,
  onOpenDetails,
  orderCount,
}) {
  const [added, setAdded] = useState(false);

  const handleAdd = (event) => {
    event.stopPropagation();

    if (item.variants?.length) {
      onOpenDetails(item);
      return;
    }

    setAdded(true);

    onAdd(item);

    setTimeout(() => {
      setAdded(false);
    }, 900);
  };

  return (
    <motion.article
      className="food-card"
      initial={{
        opacity: 0,
        y: 25,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.45,
      }}
      whileTap={{
        scale: 0.98,
      }}
      onClick={() => onOpenDetails(item)}
    >
      <div className="food-image-wrapper">
        <img
          src={item.image || FALLBACK_IMAGE}
          alt={item.name}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = FALLBACK_IMAGE;
          }}
        />

        <motion.button
          className={`add-button ${
            added ? "added" : ""
          }`}
          aria-label={item.variants?.length ? `Choose a size for ${item.name}` : `Add ${item.name}`}
          onClick={handleAdd}
          animate={
            added
              ? {
                  scale: [1, 1.2, 1],
                }
              : {
                  scale: 1,
                }
          }
        >
          {added ? (
            <Check size={19} />
          ) : (
            <Plus size={20} />
          )}
        </motion.button>
      </div>

      <div className="food-info">
        <h3>{item.name}</h3>

        {item.ratingCount > 0 && (
          <div className="food-rating" aria-label={`${Number(item.rating).toFixed(1)} out of 5 from ${item.ratingCount} ratings`}>
            <Star size={13} fill="currentColor" />
            <strong>{Number(item.rating).toFixed(1)}</strong>
            <span>({item.ratingCount})</span>
          </div>
        )}

        {orderCount > 0 && (
          <p className="food-popularity">Ordered {orderCount} times in the last 30 days</p>
        )}

        <p>{item.description}</p>

        <div className="food-bottom">
          <span className="food-price">
            {item.variants?.length ? "From " : ""}₹{item.price}
          </span>
          {item.variants?.length > 0 && (
            <div className="food-variant-prices" aria-label="Available sizes and prices">
              {item.variants.map((variant) => (
                <span key={variant.id}>{variant.name} ₹{variant.price}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}