import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Header from "./Header";
import OrderAlertToasts from "./OrderAlertToasts";
import { playOrderChime, unlockAudio, useAdminNotifications } from "../../hooks/useAdminNotifications";
import { RestaurantBrandingProvider } from "../../context/BrandingContext.jsx";

const SOUND_KEY = "admin-order-sound";

export default function AdminLayout() {
  return (
    <RestaurantBrandingProvider>
      <AdminLayoutShell />
    </RestaurantBrandingProvider>
  );
}

function AdminLayoutShell() {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);
  const [soundEnabled, setSoundEnabled] = useState(
    () => localStorage.getItem(SOUND_KEY) !== "off"
  );
  const notifications = useAdminNotifications(soundEnabled);
  const { alerts, dismiss } = notifications;

  const toggleSound = () => {
    const next = !soundEnabled;
    localStorage.setItem(SOUND_KEY, next ? "on" : "off");
    setSoundEnabled(next);
    if (next) {
      unlockAudio();
      setTimeout(playOrderChime, 50);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffaf5]">
      <AnimatePresence>
        {sidebarOpen && (
          <Sidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          open={true}
          onClose={() => {}}
        />
      </div>

      <div className="lg:pl-64">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          notifications={notifications}
        />

        <main className="p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
      <OrderAlertToasts alerts={alerts} onDismiss={dismiss} />
    </div>
  );
}