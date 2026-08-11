import { motion } from "framer-motion";
import { Plus, Check } from "lucide-react";
import { useState } from "react";

export default function FoodCard({
  item,
  onAdd,
  onOpenDetails,
}) {
  const [added, setAdded] = useState(false);

  const handleAdd = (event) => {
    event.stopPropagation();

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
          src={item.image}
          alt={item.name}
        />

        <motion.button
          className={`add-button ${
            added ? "added" : ""
          }`}
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

        <p>{item.description}</p>

        <div className="food-bottom">
          <span>₹{item.price}</span>
        </div>
      </div>
    </motion.article>
  );
}