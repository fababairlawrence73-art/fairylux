/**
 * FairyLux Mobile API Service
 * Centralized API configuration and client for the Laravel catalog backend
 * and authenticated customer endpoints (Cart, Addresses, Checkout, Orders).
 */

import { getAuth } from '@react-native-firebase/auth';

// Base URL during development with `adb reverse tcp:8000 tcp:8000` active
export const API_BASE_URL = 'http://127.0.0.1:8000/api';

/**
 * Obtain current customer's Firebase ID token for Laravel Bearer authentication.
 */
export async function getAuthHeaders() {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      const token = await currentUser.getIdToken();
      if (token) {
        return {
          Authorization: `Bearer ${token}`,
        };
      }
    }
  } catch (e) {
    console.warn('Could not retrieve Firebase ID token:', e);
  }
  return {};
}

/**
 * Helper to build query strings safely
 */
function buildQueryString(params = {}) {
  const parts = [];
  Object.keys(params).forEach((key) => {
    const val = params[key];
    if (val !== undefined && val !== null && val !== '') {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
    }
  });
  return parts.length > 0 ? `?${parts.join('&')}` : '';
}

/**
 * Generic fetch wrapper with timeout and error handling
 */
async function request(endpoint, options = {}, timeoutMs = 10000, requiresAuth = false) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const url = `${API_BASE_URL}${endpoint}`;

  let authHeaders = {};
  if (requiresAuth) {
    authHeaders = await getAuthHeaders();
  }

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options.headers,
      },
    });

    clearTimeout(timer);

    if (!response.ok) {
      let errorMsg = `Server returned ${response.status}`;
      let errorJson = null;
      try {
        errorJson = await response.json();
        if (errorJson.message) {
          errorMsg = errorJson.message;
        }
      } catch (e) {
        // Ignore parse error
      }
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = errorJson;
      throw error;
    }

    return await response.json();
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please verify the Laravel server is running.');
    }
    throw err;
  }
}

// ──────────────────────────────────────────────
// CATALOG ENDPOINTS (Public)
// ──────────────────────────────────────────────

export async function fetchCategories() {
  const result = await request('/categories');
  return result?.data || [];
}

export async function fetchProducts(params = {}) {
  const qs = buildQueryString(params);
  const result = await request(`/products${qs}`);
  return {
    data: result?.data || [],
    meta: result?.meta || {},
  };
}

export async function fetchProduct(id) {
  if (!id) {
    throw new Error('Product ID is required');
  }
  const result = await request(`/products/${encodeURIComponent(id)}`);
  return result?.data || null;
}

// ──────────────────────────────────────────────
// CART ENDPOINTS (Customer Protected)
// ──────────────────────────────────────────────

export async function fetchCart() {
  const result = await request('/cart', { method: 'GET' }, 10000, true);
  return result?.data || { items: [], items_count: 0, subtotal: 0, total: 0 };
}

export async function addToCart(variantId, quantity = 1) {
  const result = await request(
    '/cart',
    {
      method: 'POST',
      body: JSON.stringify({ variant_id: variantId, quantity }),
    },
    10000,
    true,
  );
  return result;
}

export async function updateCartQuantity(cartItemId, quantity) {
  const result = await request(
    `/cart/${cartItemId}`,
    {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    },
    10000,
    true,
  );
  return result;
}

export async function removeFromCart(cartItemId) {
  const result = await request(
    `/cart/${cartItemId}`,
    { method: 'DELETE' },
    10000,
    true,
  );
  return result;
}

// ──────────────────────────────────────────────
// ADDRESS ENDPOINTS (Customer Protected)
// ──────────────────────────────────────────────

export async function fetchAddresses() {
  const result = await request('/addresses', { method: 'GET' }, 10000, true);
  return result?.data || [];
}

export async function createAddress(addressData) {
  const result = await request(
    '/addresses',
    {
      method: 'POST',
      body: JSON.stringify(addressData),
    },
    10000,
    true,
  );
  return result?.data;
}

export async function updateAddress(id, addressData) {
  const result = await request(
    `/addresses/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(addressData),
    },
    10000,
    true,
  );
  return result?.data;
}

export async function deleteAddress(id) {
  const result = await request(
    `/addresses/${id}`,
    { method: 'DELETE' },
    10000,
    true,
  );
  return result;
}

// ──────────────────────────────────────────────
// CHECKOUT & ORDERS (Customer Protected)
// ──────────────────────────────────────────────

export async function placeOrder({ address_id, notes } = {}) {
  const result = await request(
    '/checkout',
    {
      method: 'POST',
      body: JSON.stringify({ address_id, notes }),
    },
    15000,
    true,
  );
  return result?.data;
}

export async function fetchOrders() {
  const result = await request('/orders', { method: 'GET' }, 10000, true);
  return result?.data || [];
}

export async function fetchOrder(id) {
  const result = await request(`/orders/${id}`, { method: 'GET' }, 10000, true);
  return result?.data || null;
}

export default {
  API_BASE_URL,
  getAuthHeaders,
  fetchCategories,
  fetchProducts,
  fetchProduct,
  fetchCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  fetchAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  placeOrder,
  fetchOrders,
  fetchOrder,
};
