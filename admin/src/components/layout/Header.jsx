import {
  Bell,
  Menu,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { adminApi, clearAuth, getStoredUser } from "../../services/api";

export default function Header({ onMenuClick }) {
  const navigate = useNavigate();

  const dropdownRef = useRef(null);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const storedUser = getStoredUser();
  const adminName = storedUser?.name || "Admin";

  const adminEmail =
    storedUser?.email ||
    "admin@restaurant.com";

  const restaurantName =
    storedUser?.restaurantName ||
    "Restaurant Manager";

  const adminPhoto =
    storedUser?.photoUrl ||
    "";

  useEffect(() => {
    const onDocumentClick = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target
        )
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      onDocumentClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        onDocumentClick
      );
    };
  }, []);

  const handleLogout = async () => {
    await adminApi.logout().catch(() => {});
    clearAuth();
    navigate("/login", {
      replace: true,
    });
  };

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
        <div
          ref={dropdownRef}
          className="relative"
        >
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              setProfileOpen((current) => !current)
            }
            className="flex items-center gap-3 rounded-2xl px-2 py-1.5 transition hover:bg-orange-50"
          >
            <motion.div
              animate={{
                scale: profileOpen
                  ? [1, 1.08, 1]
                  : 1,
              }}
              transition={{ duration: 0.25 }}
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#f7c59f] font-semibold text-[#8f4323]"
            >
              {adminPhoto ? (
                <img
                  src={adminPhoto}
                  alt={adminName}
                  className="h-full w-full object-cover"
                />
              ) : (
                adminName.charAt(0).toUpperCase()
              )}
            </motion.div>

            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-gray-800">
                {adminName}
              </p>

              <p className="text-xs text-gray-400">
                {restaurantName}
              </p>
            </div>

            <motion.div
              animate={{
                rotate: profileOpen ? 180 : 0,
              }}
              transition={{ duration: 0.2 }}
              className="hidden sm:block"
            >
              <ChevronDown
                size={16}
                className="text-gray-400"
              />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 8,
                  scale: 0.98,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: 8,
                  scale: 0.98,
                }}
                transition={{
                  duration: 0.18,
                }}
                className="absolute right-0 top-14 z-50 w-72 rounded-2xl border border-orange-100 bg-white p-2 shadow-xl"
              >
                <div className="rounded-xl bg-orange-50/70 p-3">
                  <p className="text-sm font-semibold text-gray-900">
                    {adminName}
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500">
                    {adminEmail}
                  </p>
                </div>

                <div className="mt-2 space-y-1">
                  <DropdownItem
                    icon={User}
                    label="My Profile"
                    onClick={() => {
                      setProfileOpen(false);
                    }}
                  />

                  <DropdownItem
                    icon={Settings}
                    label="Settings"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/settings");
                    }}
                  />

                  <DropdownItem
                    icon={LogOut}
                    label="Sign out"
                    danger
                    onClick={handleLogout}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

function DropdownItem({
  icon: Icon,
  label,
  onClick,
  danger = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
        danger
          ? "text-red-600 hover:bg-red-50"
          : "text-gray-700 hover:bg-orange-50"
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}