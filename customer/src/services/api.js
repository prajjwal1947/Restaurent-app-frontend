const API_BASE_URL = import.meta.env.DEV
  ? import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1"
  : "https://restaraunt-app-bakcend.onrender.com/api/v1";
const API_ORIGIN = new URL(API_BASE_URL).origin;

let pendingRequests = 0;
const requestListeners = new Set();

export const getPendingRequestCount = () => pendingRequests;
export function subscribeToRequests(listener) {
  requestListeners.add(listener);
  return () => requestListeners.delete(listener);
}

function notifyRequests() {
  requestListeners.forEach((listener) => listener());
}

export function resolveMediaUrl(value) {
  if (!value || typeof value !== "string") return "";
  try {
    return new URL(value, `${API_ORIGIN}/`).href;
  } catch {
    return "";
  }
}

async function request(path, options = {}) {
  pendingRequests += 1;
  notifyRequests();
  try {
    return await performRequest(path, options);
  } finally {
    pendingRequests -= 1;
    notifyRequests();
  }
}

async function performRequest(path, options) {
  const headers = new Headers(options.headers || {});
  if (options.body) headers.set("Content-Type", "application/json");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    const error = new Error(result.error?.message || `Request failed (${response.status})`);
    error.code = result.error?.code;
    error.status = response.status;
    throw error;
  }
  const result = await response.json();
  return result.data ?? result;
}

export const getTableContext = (token) => request(`/public/tables/${encodeURIComponent(token)}/context`);
export const getPublicMenu = (token) => request(`/public/tables/${encodeURIComponent(token)}/menu`);
export const getPublicTrending = (token) => request(`/public/tables/${encodeURIComponent(token)}/trending`);
export const getPublicOrderHistory = (token) => request(`/public/tables/${encodeURIComponent(token)}/orders`);
export const createPublicOrder = (token, body, key) => request(`/public/tables/${encodeURIComponent(token)}/orders`, {
  method: "POST",
  headers: { "Idempotency-Key": key },
  body,
});
export const getPublicOrder = (id) => request(`/public/orders/${encodeURIComponent(id)}`);
export const ratePublicOrder = (token, id, rating) => request(
  `/public/tables/${encodeURIComponent(token)}/orders/${encodeURIComponent(id)}/rating`,
  { method: "POST", body: { rating } }
);
export const ratePublicOrderItem = (token, orderId, orderItemId, rating) => request(
  `/public/tables/${encodeURIComponent(token)}/orders/${encodeURIComponent(orderId)}/items/${encodeURIComponent(orderItemId)}/rating`,
  { method: "POST", body: { rating } }
);