import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  ImagePlus,
  IndianRupee,
} from "lucide-react";
import { useState } from "react";

const suggestedImages = [
  "https://images.unsplash.com/photo-1513104890138-7c749659a591",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
  "https://images.unsplash.com/photo-1550547660-d9450f859349",
  "https://images.unsplash.com/photo-1544025162-d76694265947",
  "https://images.unsplash.com/photo-1482049016688-2d3e1b311543",
  "https://images.unsplash.com/photo-1499028344343-cd173ffc68a9",
];

export default function MenuItemModal({
  open,
  onClose,
  onAdd,
  categories,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] =
    useState(categories[1] || "");
  const [image, setImage] = useState("");
  const [imageSource, setImageSource] =
    useState("none");

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setImage(String(reader.result));
      setImageSource("custom");
    };

    reader.readAsDataURL(file);
  };

  const selectSuggestedImage = (url) => {
    setImage(url);
    setImageSource("suggested");
  };

  const clearImage = () => {
    setImage("");
    setImageSource("none");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !price || !category) return;

    onAdd({
      id: Date.now(),
      name,
      description,
      price: Number(price),
      category,
      available: true,
      image,
    });

    setName("");
    setDescription("");
    setPrice("");
    clearImage();

    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.92,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.92,
              y: 20,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2rem] bg-[#fffaf5] p-6 shadow-2xl"
          >
            {/* Header */}

            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-[#e86a33]">
                  MENU MANAGEMENT
                </p>

                <h2 className="mt-1 text-2xl font-bold text-gray-900">
                  Add Menu Item
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Add a new dish to your menu.
                </p>
              </div>

              <button
                onClick={onClose}
                className="rounded-xl p-2 text-gray-400 transition hover:bg-orange-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-5"
            >
              {/* Name */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Item Name
                </label>

                <input
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Margherita Pizza"
                  className="w-full rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#e86a33] focus:ring-4 focus:ring-orange-100"
                />
              </div>

              {/* Description */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Description
                </label>

                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  placeholder="Describe your dish..."
                  className="w-full resize-none rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#e86a33] focus:ring-4 focus:ring-orange-100"
                />
              </div>

              {/* Price + Category */}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Price
                  </label>

                  <div className="relative">
                    <IndianRupee
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) =>
                        setPrice(
                          e.target.value
                        )
                      }
                      placeholder="299"
                      className="w-full rounded-2xl border border-orange-100 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#e86a33] focus:ring-4 focus:ring-orange-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Category
                  </label>

                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(
                        e.target.value
                      )
                    }
                    className="w-full appearance-none rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm outline-none focus:border-[#e86a33] focus:ring-4 focus:ring-orange-100"
                  >
                    {categories
                      .filter(
                        (category) =>
                          category !== "All"
                      )
                      .map((category) => (
                        <option
                          key={category}
                          value={category}
                        >
                          {category}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Image picker */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Item Image
                </label>

                <div className="rounded-2xl border border-orange-100 bg-white p-4">
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-orange-200 bg-orange-50 px-4 py-3 text-sm font-semibold text-[#e86a33] transition hover:bg-orange-100">
                    <ImagePlus size={17} />
                    Upload Custom Image

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  <p className="mt-2 text-xs text-gray-400">
                    Or choose from suggested dish photos below.
                  </p>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {suggestedImages.map((url, index) => (
                      <button
                        key={url}
                        type="button"
                        onClick={() =>
                          selectSuggestedImage(url)
                        }
                        className={`overflow-hidden rounded-xl border transition ${
                          image === url
                            ? "border-[#e86a33] ring-2 ring-orange-200"
                            : "border-orange-100 hover:border-orange-200"
                        }`}
                      >
                        <img
                          src={url}
                          alt={`Suggestion ${index + 1}`}
                          className="h-20 w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview */}

              {image && (
                <motion.div
                  initial={{
                    opacity: 0,
                    height: 0,
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                  }}
                  className="overflow-hidden rounded-2xl"
                >
                  <img
                    src={image}
                    alt="Preview"
                    className="h-40 w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display =
                        "none";
                    }}
                  />

                  <div className="mt-2 flex items-center justify-between rounded-b-2xl bg-white px-3 py-2 text-xs">
                    <span className="font-medium text-gray-500">
                      {imageSource === "custom"
                        ? "Custom upload"
                        : "Suggested image"}
                    </span>

                    <button
                      type="button"
                      onClick={clearImage}
                      className="font-semibold text-[#e86a33]"
                    >
                      Remove
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Buttons */}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-2xl border border-orange-100 bg-white py-3 text-sm font-semibold text-gray-600 transition hover:bg-orange-50"
                >
                  Cancel
                </button>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="rounded-2xl bg-[#e86a33] py-3 text-sm font-semibold text-white shadow-md shadow-orange-100 transition hover:bg-[#d85d29]"
                >
                  Add Item
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}