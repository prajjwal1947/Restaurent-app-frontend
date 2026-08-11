import { motion } from "framer-motion";
import {
  Plus,
  Search,
  MoreVertical,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState } from "react";
import MenuItemModal from "../components/menu/MenuItemModal";

const categories = [
  "All",
  "Starters",
  "Main Course",
  "Pizza",
  "Desserts",
  "Drinks",
];

const menuItems = [
  {
    id: 1,
    name: "Margherita Pizza",
    description:
      "Classic tomato sauce, mozzarella and fresh basil",
    price: 299,
    category: "Pizza",
    available: true,
    image:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002",
  },
  {
    id: 2,
    name: "Classic Burger",
    description:
      "Juicy grilled patty with lettuce, tomato and cheese",
    price: 399,
    category: "Main Course",
    available: true,
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
  },
  {
    id: 3,
    name: "Paneer Tikka",
    description:
      "Char-grilled cottage cheese with Indian spices",
    price: 349,
    category: "Starters",
    available: true,
    image:
      "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8",
  },
  {
    id: 4,
    name: "Chocolate Brownie",
    description:
      "Warm chocolate brownie with vanilla ice cream",
    price: 249,
    category: "Desserts",
    available: false,
    image:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c",
  },
];

export default function Menu() {
  const [activeCategory, setActiveCategory] =
    useState("All");

  const [search, setSearch] =
    useState("");

  const [items, setItems] =
    useState(menuItems);

  const [showAddModal, setShowAddModal] =
    useState(false);

  const filteredItems = items.filter((item) => {
    const categoryMatch =
      activeCategory === "All" ||
      item.category === activeCategory;

    const searchMatch =
      item.name
        .toLowerCase()
        .includes(search.toLowerCase());

    return categoryMatch && searchMatch;
  });

  const toggleAvailability = (id) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              available: !item.available,
            }
          : item
      )
    );
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}

      <motion.div
        initial={{
          opacity: 0,
          y: -10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
      >
        <div>
          <p className="text-sm text-gray-400">
            Restaurant management
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Menu
          </h1>

          <p className="mt-1 text-gray-500">
            Manage your restaurant menu and
            availability.
          </p>
        </div>

        <motion.button
          whileHover={{
            y: -2,
          }}
          whileTap={{
            scale: 0.97,
          }}
          onClick={() =>
            setShowAddModal(true)
          }
          className="flex items-center justify-center gap-2 rounded-2xl bg-[#e86a33] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-orange-100"
        >
          <Plus size={18} />

          Add Menu Item
        </motion.button>
      </motion.div>

      {/* Search */}

      <div className="relative mt-8 max-w-md">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search menu..."
          className="w-full rounded-2xl border border-orange-100 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-[#e86a33]"
        />
      </div>

      {/* Categories */}

      <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() =>
              setActiveCategory(category)
            }
            className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition ${
              activeCategory === category
                ? "bg-[#e86a33] text-white"
                : "bg-white text-gray-500 hover:bg-orange-50"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Items */}

      <motion.div
        layout
        className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
      >
        {filteredItems.map((item) => (
          <motion.div
            layout
            key={item.id}
            initial={{
              opacity: 0,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            whileHover={{
              y: -4,
            }}
            className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm"
          >
            {/* Image */}

            <div className="relative h-48 overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                className={`h-full w-full object-cover transition duration-500 hover:scale-105 ${
                  !item.available
                    ? "grayscale"
                    : ""
                }`}
              />

              {!item.available && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-gray-700">
                    Currently unavailable
                  </span>
                </div>
              )}
            </div>

            {/* Content */}

            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-[#e86a33]">
                    {item.category}
                  </p>

                  <h3 className="mt-1 font-bold text-gray-900">
                    {item.name}
                  </h3>
                </div>

                <button className="rounded-xl p-2 text-gray-400 hover:bg-orange-50">
                  <MoreVertical size={18} />
                </button>
              </div>

              <p className="mt-2 line-clamp-2 text-sm text-gray-400">
                {item.description}
              </p>

              <div className="mt-5 flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">
                  ₹{item.price}
                </span>

                <button
                  onClick={() =>
                    toggleAvailability(item.id)
                  }
                  className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold ${
                    item.available
                      ? "bg-green-50 text-green-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {item.available ? (
                    <Eye size={14} />
                  ) : (
                    <EyeOff size={14} />
                  )}

                  {item.available
                    ? "Available"
                    : "Hidden"}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <MenuItemModal
        open={showAddModal}
        onClose={() =>
          setShowAddModal(false)
        }
        categories={categories}
        onAdd={(newItem) => {
          setItems((current) => [
            ...current,
            newItem,
          ]);
        }}
      />
    </div>
  );
}