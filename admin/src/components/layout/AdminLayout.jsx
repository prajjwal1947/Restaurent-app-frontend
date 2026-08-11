import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

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
        />

        <main className="p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}