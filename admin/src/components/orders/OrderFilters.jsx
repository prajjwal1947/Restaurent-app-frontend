import { Search } from "lucide-react";

const filters = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "SERVED",
];

export default function OrderFilters({
  activeFilter,
  setActiveFilter,
  search,
  setSearch,
}) {
  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search order or table..."
          className="w-full rounded-2xl border border-orange-100 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#e86a33]"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() =>
              setActiveFilter(filter)
            }
            className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition ${
              activeFilter === filter
                ? "bg-[#e86a33] text-white shadow-sm"
                : "bg-white text-gray-500 hover:bg-orange-50"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
}