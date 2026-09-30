import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  ImagePlus,
  IndianRupee,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { searchMenuImages } from "../../services/searchMenuImages";

export default function MenuItemModal({
  open,
  onClose,
  onAdd,
  categories,
  initialItem = null,
}) {
  const [name, setName] = useState(initialItem?.name || "");
  const [description, setDescription] =
    useState(initialItem?.description || "");
  const [price, setPrice] = useState(initialItem?.price == null ? "" : String(initialItem.price));
  const [variants, setVariants] = useState(() => (initialItem?.variants || []).map((variant) => ({
    id: variant.id || crypto.randomUUID(),
    name: variant.name,
    price: String(variant.price),
  })));
  const [category, setCategory] = useState(initialItem?.category || "");
  const [image, setImage] = useState(initialItem?.image || "");
  const [imageSource, setImageSource] =
    useState(initialItem?.image ? "Suggested image" : "none");
  const [imageSuggestions, setImageSuggestions] = useState([]);
  const [imageSearchQuery, setImageSearchQuery] = useState("");
  const [searchingImages, setSearchingImages] = useState(false);
  const [imageSearchError, setImageSearchError] = useState("");

  useEffect(() => {
    const query = name.trim();
    let active = true;

    if (query.length < 2) {
      return undefined;
    }

    const timeoutId = window.setTimeout(async () => {
      setImageSearchQuery(query);
      setSearchingImages(true);
      setImageSearchError("");
      try {
        const suggestions = await searchMenuImages(query);
        if (active) setImageSuggestions(suggestions);
      } catch (error) {
        if (active) {
          setImageSuggestions([]);
          setImageSearchError(error.message);
        }
      } finally {
        if (active) setSearchingImages(false);
      }
    }, 450);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [name]);

  const currentImageSuggestions = imageSearchQuery === name.trim()
    ? imageSuggestions
    : [];
  const currentImageSearchError = imageSearchQuery === name.trim()
    ? imageSearchError
    : "";

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

  const selectSuggestedImage = (suggestion) => {
    setImage(suggestion.url);
    setImageSource("Wikimedia Commons");
  };

  const clearImage = () => {
    setImage("");
    setImageSource("none");
  };

  const categoryOptions = categories.filter((option) => option !== "All");
  const selectedCategory = category || categoryOptions[0] || "";
  const variantNames = variants.map((variant) => variant.name.trim().toLowerCase());
  const variantsValid = variants.length === 0 || (
    variants.every((variant) =>
      variant.name.trim() && variant.price !== "" && Number.isFinite(Number(variant.price)) && Number(variant.price) >= 0
    ) && new Set(variantNames).size === variants.length
  );
  const priceValid = variants.length > 0
    ? variantsValid
    : price !== "" && Number.isFinite(Number(price)) && Number(price) >= 0;
  const canSubmit = Boolean(name.trim() && selectedCategory && priceValid);

  const addVariant = () => {
    setVariants((current) => [...current, { id: crypto.randomUUID(), name: "", price: "" }]);
  };

  const updateVariant = (id, field, value) => {
    setVariants((current) => current.map((variant) =>
      variant.id === id ? { ...variant, [field]: value } : variant
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canSubmit) return;
    const sizeOptions = variants.map((variant, sortOrder) => ({
      name: variant.name.trim(),
      price: Number(variant.price),
      sortOrder,
    }));

    const saved = await onAdd({
      id: initialItem?.id,
      name,
      description,
      price: sizeOptions.length
        ? Math.min(...sizeOptions.map((variant) => variant.price))
        : Number(price),
      variants: sizeOptions,
      category: selectedCategory,
      available: true,
      image,
    });
    if (saved === false) return;

    setName("");
    setDescription("");
    setPrice("");
    setVariants([]);
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
                  {initialItem ? "Edit Menu Item" : "Add Menu Item"}
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  {initialItem ? "Update this dish and its size prices." : "Add a new dish to your menu."}
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
                    {variants.length ? "Starting price" : "Price"}
                  </label>

                  {variants.length ? (
                    <p className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-gray-600">
                      Set by the lowest size price below.
                    </p>
                  ) : (
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
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="299"
                        className="w-full rounded-2xl border border-orange-100 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#e86a33] focus:ring-4 focus:ring-orange-100"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Category
                  </label>

                  <select
                    value={selectedCategory}
                    onChange={(e) =>
                      setCategory(
                        e.target.value
                      )
                    }
                    className="w-full appearance-none rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm outline-none focus:border-[#e86a33] focus:ring-4 focus:ring-orange-100"
                  >
                    {categoryOptions.length === 0 ? (
                      <option value="">Add a category first</option>
                    ) : categoryOptions.map((category) => (
                        <option
                          key={category}
                          value={category}
                        >
                          {category}
                        </option>
                      ))}
                  </select>
                  {categoryOptions.length === 0 && (
                    <p className="mt-1 text-xs text-red-600">
                      No categories available. Add one from the Menu page.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">
                      Size options
                    </label>
                    <p className="mt-1 text-xs text-gray-400">
                      Optional prices for sizes such as Small, Medium, and Large.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="flex shrink-0 items-center gap-1 rounded-xl border border-orange-200 px-3 py-2 text-xs font-semibold text-[#e86a33] hover:bg-orange-50"
                  >
                    <Plus size={15} />
                    Add size
                  </button>
                </div>

                {variants.map((variant, index) => (
                  <div key={variant.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_40px] gap-2">
                    <input
                      value={variant.name}
                      onChange={(event) => updateVariant(variant.id, "name", event.target.value)}
                      aria-label={`Size ${index + 1} name`}
                      placeholder={index === 0 ? "Small" : index === 1 ? "Medium" : "Large"}
                      className="min-w-0 rounded-xl border border-orange-100 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#e86a33]"
                    />
                    <div className="relative">
                      <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={variant.price}
                        onChange={(event) => updateVariant(variant.id, "price", event.target.value)}
                        aria-label={`${variant.name || `Size ${index + 1}`} price`}
                        placeholder="Price"
                        className="w-full rounded-xl border border-orange-100 bg-white py-2.5 pl-8 pr-2 text-sm outline-none focus:border-[#e86a33]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setVariants((current) => current.filter((option) => option.id !== variant.id))}
                      aria-label={`Remove ${variant.name || `size ${index + 1}`}`}
                      className="flex items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}

                {!variantsValid && (
                  <p className="text-xs text-red-600">Enter a unique name and price for each size.</p>
                )}
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
                    {name.trim().length < 2
                      ? "Enter a dish name to search related images."
                      : searchingImages && imageSearchQuery === name.trim()
                        ? "Searching Wikimedia Commons..."
                        : `${currentImageSuggestions.length} image suggestions from Wikimedia Commons`}
                  </p>

                  {currentImageSearchError && (
                    <p role="status" className="mt-2 text-xs text-red-600">
                      {currentImageSearchError}
                    </p>
                  )}

                  {!searchingImages && !currentImageSearchError && name.trim().length >= 2 && currentImageSuggestions.length === 0 && (
                    <p className="mt-2 text-xs text-gray-500">No matching images found. Try another search term.</p>
                  )}

                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {currentImageSuggestions.map((suggestion) => (
                      <div key={suggestion.sourceUrl || suggestion.url}>
                        <button
                          type="button"
                          onClick={() => selectSuggestedImage(suggestion)}
                          aria-label={`Use ${suggestion.title}`}
                          className={`w-full overflow-hidden rounded-xl border transition ${
                            image === suggestion.url
                              ? "border-[#e86a33] ring-2 ring-orange-200"
                              : "border-orange-100 hover:border-orange-200"
                          }`}
                        >
                          <img
                            src={suggestion.url}
                            alt={suggestion.title}
                            className="h-24 w-full object-cover"
                            loading="lazy"
                          />
                        </button>
                        <p className="mt-1 truncate text-[10px] text-gray-500" title={suggestion.title}>
                          {suggestion.title}
                        </p>
                        <p className="truncate text-[10px] text-gray-400" title={`${suggestion.artist || "Author unknown"} · ${suggestion.license || "License details"}`}>
                          {suggestion.artist || "Author unknown"} · {suggestion.license || "License details"}
                          {suggestion.sourceUrl && (
                            <a
                              href={suggestion.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="ml-1 font-medium text-[#e86a33]"
                            >
                              Source
                            </a>
                          )}
                        </p>
                      </div>
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
                  disabled={!canSubmit}
                  className="rounded-2xl bg-[#e86a33] py-3 text-sm font-semibold text-white shadow-md shadow-orange-100 transition hover:bg-[#d85d29] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {initialItem ? "Save Changes" : "Add Item"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
