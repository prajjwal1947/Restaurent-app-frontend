import {
  ShoppingBag,
  Clock3,
  ChefHat,
  IndianRupee,
} from "lucide-react";
import { motion } from "framer-motion";

import StatCard from "../components/dashboard/StatCard";
import LiveOrders from "../components/dashboard/LiveOrders";

export default function Dashboard() {
  return (
    <div className="mx-auto max-w-7xl">
      {/* Welcome */}
      <motion.div
        initial={{
          opacity: 0,
          y: -10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="mb-8"
      >
        <p className="text-sm text-gray-400">
          Tuesday, August 11
        </p>

        <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
          Good evening 👋
        </h1>

        <p className="mt-1 text-gray-500">
          Here's what's happening at your
          restaurant today.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Today's Orders"
          value="42"
          trend="+12.5%"
          subtitle="vs yesterday"
          icon={<ShoppingBag size={21} />}
        />

        <StatCard
          title="Pending Orders"
          value="8"
          subtitle="Need attention"
          icon={<Clock3 size={21} />}
        />

        <StatCard
          title="Preparing"
          value="6"
          subtitle="In kitchen"
          icon={<ChefHat size={21} />}
        />

        <StatCard
          title="Today's Revenue"
          value="₹24.8K"
          trend="+8.2%"
          subtitle="vs yesterday"
          icon={<IndianRupee size={21} />}
        />
      </div>

      {/* Content */}
      <div className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
          <LiveOrders />
        </div>

        <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
          <div>
            <h3 className="font-semibold text-gray-900">
              Today's Sales
            </h3>

            <p className="text-sm text-gray-400">
              Revenue overview
            </p>
          </div>

          <div className="mt-8 flex h-64 items-end gap-3">
            {[35, 55, 45, 70, 60, 82, 68].map(
              (height, index) => (
                <motion.div
                  key={index}
                  initial={{
                    height: 0,
                  }}
                  animate={{
                    height: `${height}%`,
                  }}
                  transition={{
                    delay: index * 0.08,
                    duration: 0.5,
                  }}
                  className="flex-1 rounded-t-xl bg-[#f7c59f]"
                />
              )
            )}
          </div>

          <div className="mt-3 flex justify-between text-xs text-gray-400">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>
      </div>
    </div>
  );
}