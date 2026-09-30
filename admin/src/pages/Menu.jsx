import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Pencil,
  Eye,
  EyeOff,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";
import MenuItemModal from "../components/menu/MenuItemModal";
import BulkMenuImportModal from "../components/menu/BulkMenuImportModal";
import { adminApi } from "../services/api";

export default function Menu() {
  const [activeCategory, setActiveCategory] =
    useState("All");

  const [search, setSearch] =
    useState("");

  const [items, setItems] = useState([]);
  const [categoryRecords, setCategoryRecords] = useState([]);
  const [error, setError] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);

  useEffect(() => {
    Promise.all([adminApi.categories(), adminApi.menuItems("page=1&pageSize=100")])
      .then(([categoryResult, itemResult]) => {
        setCategoryRecords(normalizeCategories(categoryResult));
        setItems((itemResult || []).map(normalizeItem));
      })
      .catch((requestError) => setError(requestError.message));
  }, []);

  const categories = ["All", ...categoryRecords.map((category) => category.name)];

  const addCategory = async (event) => {
    event.preventDefault();
    const name = categoryName.trim();
    if (!name) return;
    setSavingCategory(true);
    setError("");
    try {
      const created = await adminApi.createCategory({
        name,
        sortOrder: categoryRecords.length,
      });
      const record = created?.category || created;
      setCategoryRecords((current) => [...current, record]);
      setActiveCategory(record.name);
      setCategoryName("");
      setShowCategoryForm(false);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingCategory(false);
    }
  };

  const [showAddModal, setShowAddModal] =
    useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

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

  const toggleAvailability = async (id) => {
    const item = items.find((currentItem) => currentItem.id === id);
    if (!item) return;
    try {
      await adminApi.setAvailability(id, !item.available);
      setItems((current) => current.map((currentItem) =>
        currentItem.id === id ? { ...currentItem, available: !item.available } : currentItem
      ));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
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

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => setShowBulkImport(true)}
            className="flex items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-white px-5 py-3 text-sm font-semibold text-[#b9572b] hover:bg-orange-50"
          >
            <Upload size={17} />
            Import from photo
          </button>
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#e86a33] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-orange-100"
          >
            <Plus size={18} />
            Add Menu Item
          </motion.button>
        </div>
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
        <button
          type="button"
          onClick={() => setShowCategoryForm((open) => !open)}
          className="whitespace-nowrap rounded-full border border-dashed border-orange-300 px-4 py-2 text-xs font-semibold text-[#e86a33]"
        >
          + Add Category
        </button>
      </div>

      {showCategoryForm && (
        <form onSubmit={addCategory} className="mt-2 flex max-w-md gap-2">
          <input
            autoFocus
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
            placeholder="Category name"
            aria-label="New category name"
            className="min-w-0 flex-1 rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#e86a33]"
          />
          <button
            type="submit"
            disabled={savingCategory || !categoryName.trim()}
            className="rounded-xl bg-[#e86a33] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {savingCategory ? "Saving..." : "Save"}
          </button>
        </form>
      )}

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

                <button
                  type="button"
                  onClick={() => setEditingItem(item)}
                  aria-label={`Edit ${item.name}`}
                  title="Edit menu item"
                  className="rounded-xl p-2 text-gray-400 hover:bg-orange-50"
                >
                  <Pencil size={18} />
                </button>
              </div>

              <p className="mt-2 line-clamp-2 text-sm text-gray-400">
                {item.description}
              </p>

              <div className="mt-5 flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">
                  {item.variants?.length ? "From " : ""}₹{item.price}
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

      {(showAddModal || editingItem) && <MenuItemModal
        key={editingItem?.id || "new-menu-item"}
        open
        initialItem={editingItem}
        onClose={() => {
          setShowAddModal(false);
          setEditingItem(null);
        }}
        categories={categories}
        onAdd={async (newItem) => {
          const category = categoryRecords.find((record) => record.name === newItem.category);
          if (!category) return false;
          try {
            const payload = {
              name: newItem.name,
              description: newItem.description,
              categoryId: category.id,
              priceMinor: Math.round(newItem.price * 100),
              imageUrl: newItem.image,
              variants: newItem.variants.map((variant) => ({
                name: variant.name,
                priceMinor: Math.round(variant.price * 100),
                sortOrder: variant.sortOrder,
              })),
              isAvailable: true,
              sortOrder: 0,
              addOnIds: [],
            };
            if (editingItem) {
              const updated = await adminApi.updateMenuItem(editingItem.id, payload);
              setItems((current) => current.map((item) =>
                item.id === editingItem.id ? normalizeItem(updated) : item
              ));
            } else {
              const created = await adminApi.createMenuItem(payload);
              setItems((current) => [...current, normalizeItem(created)]);
            }
            return true;
          } catch (requestError) {
            setError(requestError.message);
            return false;
          }
        }}
      />}

      {showBulkImport && (
        <BulkMenuImportModal
          categories={categoryRecords}
          onClose={() => setShowBulkImport(false)}
          onImport={async (rows) => {
            const payload = rows.map((row, index) => {
              const category = categoryRecords.find((record) => record.name === row.category);
              if (!category) throw new Error(`Category "${row.category}" is no longer available.`);
              return {
                name: row.name,
                description: row.description || "",
                categoryId: category.id,
                priceMinor: Math.round(row.price * 100),
                imageUrl: row.imageUrl || "",
                isAvailable: true,
                sortOrder: items.length + index,
                addOnIds: [],
              };
            });
            const created = await adminApi.createMenuItemsBulk({ items: payload });
            setItems((current) => [...current, ...created.map(normalizeItem)]);
          }}
        />
      )}
    </div>
  );
}

function normalizeItem(item) {
  const variants = (item.variants || []).map((variant) => ({
    ...variant,
    price: Math.round((variant.priceMinor || 0) / 100),
  }));
  return {
    ...item,
    variants,
    price: variants.length
      ? Math.min(...variants.map((variant) => variant.price))
      : Math.round((item.priceMinor || 0) / 100),
    category: item.category?.name || item.category || "Uncategorized",
    available: item.isAvailable ?? item.available ?? false,
    image: item.imageUrl || item.image || "",
  };
}

function normalizeCategories(result) {
  const categories = Array.isArray(result)
    ? result
    : result?.categories || result?.items || [];
  return categories.filter((category) => category?.id && category?.name);
}