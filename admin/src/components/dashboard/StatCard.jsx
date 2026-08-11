import { motion } from "framer-motion";

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      whileHover={{
        y: -4,
      }}
      transition={{
        duration: 0.35,
      }}
      className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400">
            {title}
          </p>

          <h3 className="mt-2 text-2xl font-bold text-gray-900">
            {value}
          </h3>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-[#e86a33]">
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {trend && (
          <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-600">
            {trend}
          </span>
        )}

        <span className="text-xs text-gray-400">
          {subtitle}
        </span>
      </div>
    </motion.div>
  );
}