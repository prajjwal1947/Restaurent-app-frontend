import { apiRequest } from "./api";

/**
 * Urban Piper Order Management Service
 * Handles fetching and managing orders from Swiggy and Zomato via Urban Piper
 */

export const urbanPiperService = {
  /**
   * Fetch all Urban Piper orders (Swiggy, Zomato, etc.)
   */
  fetchOrders: (page = 1, pageSize = 100) =>
    apiRequest(`/urbanpiper/orders?page=${page}&pageSize=${pageSize}`),

  /**
   * Fetch a specific Urban Piper order by ID
   */
  getOrder: (orderId) =>
    apiRequest(`/urbanpiper/orders/${orderId}`),

  /**
   * Update order status (Acknowledged, Food Ready, Dispatched)
   */
  updateOrderStatus: (orderId, status, prepTimeMinutes) =>
    apiRequest(`/urbanpiper/orders/${orderId}/status`, {
      method: "POST",
      body: {
        status,
        ...(prepTimeMinutes !== undefined && { prepTimeMinutes }),
      },
    }),

  /**
   * Acknowledge order (accept)
   */
  acceptOrder: (orderId, prepTimeMinutes = 0) =>
    urbanPiperService.updateOrderStatus(orderId, "Acknowledged", prepTimeMinutes),

  /**
   * Mark order as ready
   */
  markOrderReady: (orderId) =>
    urbanPiperService.updateOrderStatus(orderId, "Food Ready"),

  /**
   * Mark order as dispatched
   */
  dispatchOrder: (orderId) =>
    urbanPiperService.updateOrderStatus(orderId, "Dispatched"),
};

/**
 * Helper function to get order source label and icon
 */
export const getOrderSource = (order) => {
  const channelMap = {
    swiggy: { label: "Swiggy", emoji: "🛵", color: "text-orange-500" },
    zomato: { label: "Zomato", emoji: "🍕", color: "text-red-500" },
    direct: { label: "Direct", emoji: "📱", color: "text-blue-500" },
  };

  const channel = order.channel?.toLowerCase() || "direct";
  return channelMap[channel] || channelMap.direct;
};

/**
 * Helper function to format order status
 */
export const formatOrderStatus = (status) => {
  const statusMap = {
    pending: "Pending",
    Acknowledged: "Accepted",
    "Food Ready": "Ready",
    Dispatched: "Dispatched",
    customer_cancelled: "Cancelled",
    restaurant_cancelled: "Cancelled",
  };

  return statusMap[status] || status;
};

/**
 * Helper function to get status badge color
 */
export const getStatusColor = (status) => {
  const colorMap = {
    pending: "bg-yellow-100 text-yellow-800",
    Acknowledged: "bg-blue-100 text-blue-800",
    "Food Ready": "bg-green-100 text-green-800",
    Dispatched: "bg-purple-100 text-purple-800",
    customer_cancelled: "bg-red-100 text-red-800",
    restaurant_cancelled: "bg-red-100 text-red-800",
  };

  return colorMap[status] || "bg-gray-100 text-gray-800";
};

/**
 * Normalize Urban Piper order to match internal format
 */
export const normalizeUrbanPiperOrder = (order) => {
  const payload = order.payload || {};
  const orderDetails = payload.order?.details || {};
  const customerInfo = payload.order?.customer || {};
  const items = payload.order?.items || [];

  return {
    id: order.id,
    externalOrderId: order.externalOrderId,
    channel: order.channel,
    source: getOrderSource(order),
    status: order.status,
    statusFormatted: formatOrderStatus(order.status),
    createdAt: order.createdAt,
    updatedAt: order.statusUpdatedAt || order.updatedAt,
    customer: {
      name: customerInfo.name || "Unknown Customer",
      phone: customerInfo.phone || "",
      email: customerInfo.email || "",
      address: customerInfo.address || "",
    },
    items: items.map((item) => ({
      id: item.external_id || item.id,
      name: item.name || "",
      quantity: item.quantity || 1,
      price: parseFloat(item.price) || 0,
      specialInstructions: item.instructions || "",
    })),
    total: parseFloat(orderDetails.total) || 0,
    subtotal: parseFloat(orderDetails.subtotal) || 0,
    taxes: parseFloat(orderDetails.taxes) || 0,
    deliveryFee: parseFloat(orderDetails.delivery_charge) || 0,
    discountAmount: parseFloat(orderDetails.discount) || 0,
    paymentMethod: orderDetails.payment_method || "Unknown",
    deliveryAddress: customerInfo.delivery_address || "",
    notes: orderDetails.notes || "",
    isMarketplaceOrder: true,
  };
};
