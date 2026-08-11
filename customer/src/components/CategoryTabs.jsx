import { motion } from "framer-motion";

export default function CategoryTabs({
  categories,
  selectedCategory,
  onCategoryChange,
}) {
  return (
    <div className="category-wrapper">
      <p className="section-label">CATEGORIES</p>

      <div className="categories">
        {categories.map((category) => {
          const active = category === selectedCategory;

          return (
            <button
              key={category}
              className={`category ${active ? "active" : ""}`}
              onClick={() => onCategoryChange(category)}
            >
              {category}

              {active && (
                <motion.div
                  layoutId="active-category"
                  className="category-indicator"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}