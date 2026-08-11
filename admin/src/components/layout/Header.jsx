import {
  Bell,
  Menu,
  ChevronDown,
} from "lucide-react";

export default function Header({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-orange-100 bg-[#fffaf5]/90 px-5 backdrop-blur-md lg:px-8">
      <button
        onClick={onMenuClick}
        className="rounded-xl p-2 text-gray-600 hover:bg-orange-50 lg:hidden"
      >
        <Menu size={22} />
      </button>

      <div className="hidden lg:block">
        <p className="text-sm text-gray-400">
          Restaurant Management
        </p>

        <h2 className="font-semibold text-gray-900">
          Admin Dashboard
        </h2>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* Notification */}
        <button className="relative rounded-xl p-2.5 text-gray-600 transition hover:bg-orange-50">
          <Bell size={20} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#e86a33]" />
        </button>

        {/* Profile */}
        <button className="flex items-center gap-3 rounded-2xl px-2 py-1.5 transition hover:bg-orange-50">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f7c59f] font-semibold text-[#8f4323]">
            A
          </div>

          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold text-gray-800">
              Admin
            </p>

            <p className="text-xs text-gray-400">
              Restaurant Manager
            </p>
          </div>

          <ChevronDown
            size={16}
            className="hidden text-gray-400 sm:block"
          />
        </button>
      </div>
    </header>
  );
}