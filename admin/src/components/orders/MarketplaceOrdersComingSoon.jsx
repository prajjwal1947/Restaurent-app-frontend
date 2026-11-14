import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { useRestaurantBranding } from "../../context/BrandingStore";

export default function MarketplaceOrdersComingSoon() {
  const { branding } = useRestaurantBranding();

  const gradientStart = branding?.gradientStart || "#e86a33";
  const gradientEnd = branding?.gradientEnd || "#f7c59f";

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        {/* Card Container */}
        <div
          className="rounded-2xl p-8 md:p-12 text-white shadow-2xl"
          style={{
            background: `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`,
          }}
        >
          {/* Header Icon */}
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center"
            >
              <Clock size={32} className="text-white" />
            </motion.div>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Coming Soon
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-center opacity-90 mb-8">
            Marketplace Orders Integration
          </p>

          {/* Description */}
          <div className="bg-white bg-opacity-15 rounded-xl p-6 mb-8 backdrop-blur-sm">
            <p className="text-center text-white leading-relaxed">
              We're working on integrating marketplace orders from popular
              delivery platforms. This feature will be available soon.
            </p>
          </div>

          {/* Feature List */}
          <div className="space-y-3 mb-8">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-white bg-opacity-30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm">✓</span>
              </div>
              <p className="text-white">
                Unified dashboard for all marketplace orders
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-white bg-opacity-30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm">✓</span>
              </div>
              <p className="text-white">
                Manage orders and track status in real-time
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-white bg-opacity-30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm">✓</span>
              </div>
              <p className="text-white">
                Automatic order synchronization
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-white bg-opacity-30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm">✓</span>
              </div>
              <p className="text-white">
                Streamline your order management workflow
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm">
            <p className="text-center text-white">
              We're excited to bring this feature to you soon. Thank you for
              your patience!
            </p>
          </div>

          {/* Footer Note */}
          <div className="mt-8 pt-6 border-t border-white border-opacity-20">
            <p className="text-center text-white text-sm opacity-75">
              Stay tuned for updates!
            </p>
          </div>
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800"
        >
          <p className="font-semibold mb-2">📌 Stay Updated:</p>
          <p>
            We'll notify you as soon as marketplace order integration is available.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
