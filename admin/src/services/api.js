const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1";
const ACCESS_TOKEN_KEY = "admin-access-token";
const REFRESH_TOKEN_KEY = "admin-refresh-token";
const USER_KEY = "admin-user";

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

export function storeAuth({ accessToken, refreshToken, user }) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return false;
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!response.ok) return false;
  const result = await response.json();
  storeAuth(result.data);
  return true;
}

export async function apiRequest(path, options = {}, canRetry = true) {
  const headers = new Headers(options.headers || {});
  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body && !(options.body instanceof FormData)
      ? JSON.stringify(options.body)
      : options.body,
  });

  if (response.status === 401 && canRetry && await refreshAccessToken()) {
    return apiRequest(path, options, false);
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const error = new Error(body.error?.message || `Request failed (${response.status})`);
    error.code = body.error?.code;
    error.status = response.status;
    throw error;
  }
  if (response.status === 204) return null;
  const result = await response.json();
  return result.data ?? result;
}

export const adminApi = {
  login: (body) => apiRequest("/auth/login", { method: "POST", body }),
  register: (body) => apiRequest("/auth/register", { method: "POST", body }),
  logout: () => apiRequest("/auth/logout", {
    method: "POST",
    body: { refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY) },
  }),
  dashboard: () => Promise.all([
    apiRequest("/dashboard/summary"),
    apiRequest("/dashboard/sales?interval=day"),
    apiRequest("/dashboard/live-orders"),
  ]),
  productAnalytics: () => apiRequest("/dashboard/product-analytics"),
  categories: () => apiRequest("/menu/categories"),
  createCategory: (body) => apiRequest("/menu/categories", { method: "POST", body }),
  menuItems: (params = "") => apiRequest(`/menu/items${params ? `?${params}` : ""}`),
  createMenuItem: (body) => apiRequest("/menu/items", { method: "POST", body }),
  createMenuItemsBulk: (body) => apiRequest("/menu/items/bulk", { method: "POST", body }),
  updateMenuItem: (id, body) => apiRequest(`/menu/items/${id}`, { method: "PATCH", body }),
  setAvailability: (id, isAvailable) => apiRequest(`/menu/items/${id}/availability`, {
    method: "PATCH", body: { isAvailable },
  }),
  tables: (params = "") => apiRequest(`/tables${params ? `?${params}` : ""}`),
  createTable: (body) => apiRequest("/tables", { method: "POST", body }),
  orders: (params = "") => apiRequest(`/orders${params ? `?${params}` : ""}`),
  setOrderStatus: (id, status) => apiRequest(`/orders/${id}/status`, {
    method: "PATCH", body: { status },
  }),
  restaurant: () => apiRequest("/restaurant"),
  updateRestaurant: (body) => apiRequest("/restaurant", { method: "PATCH", body }),
};