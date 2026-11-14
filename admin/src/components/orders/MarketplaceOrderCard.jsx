import { motion } from "framer-motion";
import {
  getOrderSource,
  formatOrderStatus,
  getStatusColor,
} from "../../services/urbanPiperService";

export default function MarketplaceOrderCard({
  order,
  onAccept,
  onMarkReady,
  onDispatch,
  isLoading = false,
}) {
  const source = getOrderSource(order);
  const statusColor = getStatusColor(order.status);

  const canAccept = order.status === "pending";
  const canMarkReady = order.status === "Acknowledged";
  const canDispatch = order.status === "Food Ready";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500"
    >
      {/* Header with Order Info */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{source.emoji}</span>
            <h3 className="text-lg font-semibold text-gray-800">
              {source.label} Order
            </h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
              {formatOrderStatus(order.status)}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Order ID: <span className="font-mono font-semibold">#{order.externalOrderId}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">
            ₹{order.total.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {order.items.length} item{order.items.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-gray-800 mb-2">Customer Details</h4>
        <div className="space-y-1 text-sm">
          <p className="text-gray-700">
            <span className="font-semibold">Name:</span> {order.customer.name}
          </p>
          {order.customer.phone && (
            <p className="text-gray-700">
              <span className="font-semibold">Phone:</span> {order.customer.phone}
            </p>
          )}
          {order.deliveryAddress && (
            <p className="text-gray-700">
              <span className="font-semibold">Delivery:</span> {order.deliveryAddress}
            </p>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-4">
        <h4 className="font-semibold text-gray-800 mb-2">Items</h4>
        <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto">
          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start text-sm">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{item.name}</p>
                  {item.specialInstructions && (
                    <p className="text-xs text-gray-600 italic mt-1">
                      Note: {item.specialInstructions}
                    </p>
                  )}
                </div>
                <div className="text-right ml-2">
                  <p className="font-semibold text-gray-800">
                    x{item.quantity}
                  </p>
                  <p className="text-gray-600">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal:</span>
          <span className="text-gray-800">₹{order.subtotal.toFixed(2)}</span>
        </div>
        {order.taxes > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Taxes:</span>
            <span className="text-gray-800">₹{order.taxes.toFixed(2)}</span>
          </div>
        )}
        {order.deliveryFee > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Delivery Fee:</span>
            <span className="text-gray-800">₹{order.deliveryFee.toFixed(2)}</span>
          </div>
        )}
        {order.discountAmount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount:</span>
            <span>-₹{order.discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="border-t border-gray-300 pt-1 flex justify-between font-semibold">
          <span className="text-gray-800">Total:</span>
          <span className="text-gray-900">₹{order.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment and Notes */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div>
          <p className="text-gray-600">Payment Method</p>
          <p className="font-semibold text-gray-800">{order.paymentMethod}</p>
        </div>
        {order.notes && (
          <div className="col-span-2">
            <p className="text-gray-600">Special Instructions</p>
            <p className="text-gray-800 italic">{order.notes}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t border-gray-200">
        {canAccept && (
          <button
            onClick={() => onAccept(order.id)}
            disabled={isLoading}
            className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            {isLoading ? "Processing..." : "Accept Order"}
          </button>
        )}

        {canMarkReady && (
          <button
            onClick={() => onMarkReady(order.id)}
            disabled={isLoading}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            {isLoading ? "Processing..." : "Mark Ready"}
          </button>
        )}

        {canDispatch && (
          <button
            onClick={() => onDispatch(order.id)}
            disabled={isLoading}
            className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            {isLoading ? "Processing..." : "Dispatch"}
          </button>
        )}

        {!canAccept && !canMarkReady && !canDispatch && (
          <div className="flex-1 bg-gray-100 text-gray-600 font-semibold py-2 px-4 rounded-lg text-center">
            No actions available
          </div>
        )}
      </div>
    </motion.div>
  );
}
