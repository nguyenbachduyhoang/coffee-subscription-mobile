import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { decodeJwt } from '../hooks/jwtDecode';
import { API_BASE_URL } from '@env';

// Prefer .env API_BASE_URL, fallback to provided URL
const BASE_URL = API_BASE_URL || 'http://minhkhoi02-001-site1.anytempurl.com/api';
const ALTERNATIVE_BASE_URLS = [BASE_URL];


// Create a separate axios instance instead of using global axios
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      console.log('🌐 API Request:', config.method?.toUpperCase(), config.url);
      const isLoginRequest = (config.url || '').toLowerCase().includes('/login');
      const skipAuthHeader = (config.headers as any)?.['x-skip-auth'] === 'true';
      
      if (!isLoginRequest && !skipAuthHeader) {
        // Add auth token if available (React Native compatible)
        let token = await AsyncStorage.getItem('token');
        if (!token) {
          // fallback: read from SecureStore 'user'
          const userData = await SecureStore.getItemAsync('user');
          if (userData) {
            try {
              const parsed = JSON.parse(userData);
              token = parsed?.token;
              console.log('🔍 Token found in SecureStore user data');
            } catch {}
          }
        }
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('🔑 Token added to request:', token.substring(0, 20) + '...');
          console.log('📋 Request headers:', config.headers);
        } else {
          console.log('❌ No token found in storage');
        }
      } else {
        console.log('🚫 Skipping auth header for:', config.url);
      }
    } catch (error) {
      console.log('Error getting token from storage:', error);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    const isLoginRequest = (error.config?.url || '').toLowerCase().includes('/login');
    console.error('❌ API Error:', error.response?.status, error.config?.url);
    console.error('Error details:', error.response?.data);
    
    // Log chi tiết cho lỗi 403
    if (error.response?.status === 403) {
      console.error('🚫 Forbidden (403) - Possible causes:');
      console.error('   - Insufficient permissions');
      console.error('   - Token expired or invalid');
      console.error('   - Role-based access control');
      console.error('   - Request headers:', error.config?.headers);
    }
    
    // Only handle 401 for non-login requests and when we have a token
    if (!isLoginRequest && error.response?.status === 401) {
      // Check if we actually have a token to avoid redirecting guest users
      AsyncStorage.getItem('token').then(token => {
        if (token) {
          console.log('🚫 Unauthorized access with token, redirecting to login');
        } else {
          console.log('🚫 Unauthorized access without token - guest user, not redirecting');
        }
      }).catch(() => {
        console.log('🚫 Unauthorized access - error checking token, not redirecting');
      });
    }
    return Promise.reject(error);
  }
);

// ===== AUTHENTICATION API =====
export const authApi = {
  // Test token validity
  testToken: async () => {
    try {
      console.log('🧪 Testing token validity...');
      const res = await api.get('/customers/my-profile');
      console.log('✅ Token is valid, profile fetched successfully');
      return { valid: true, data: res.data };
    } catch (error: any) {
      console.log('❌ Token test failed:', error.response?.status, error.response?.data);
      return { valid: false, error: error.response?.status, message: error.response?.data };
    }
  },

  // Customer authentication
  loginCustomer: async (email: string, password: string) => {
    try {
      console.log('Attempting customer login for:', email);
      console.log('Login URL:', `${BASE_URL}/customers/login`);
      const res = await api.post('/customers/login', { email, password }, {
        headers: { 'Accept': '*/*', 'Content-Type': 'application/json', 'x-skip-auth': 'true' },
        responseType: 'text'
      });
      console.log('Login response:', res.data);
      return res.data;
    } catch (error: any) {
      console.error('Customer login error:', error.response?.data || error.message);
      console.error('Login error details:', error.response?.status, error.response?.data);
      throw error;
    }
  },

  // Staff authentication
  loginStaff: async (email: string, password: string) => {
    try {
      console.log('Attempting staff login for:', email);
      const endpoints = ['/staffs/login', '/Staffs/login', '/Staff/login', '/staff/login'];
      let lastErr: any = null;
      const body = { email: email.trim(), password: password.trim() };
      for (const ep of endpoints) {
        try {
          console.log('Trying staff login URL:', `${BASE_URL}${ep}`);
          const res = await api.post(ep, body, {
            headers: { 'Accept': '*/*', 'Content-Type': 'application/json', 'x-skip-auth': 'true' },
            responseType: 'text'
          });
          return res.data;
        } catch (e: any) {
          lastErr = e;
          console.error('Staff login try failed:', ep, e?.response?.status, e?.response?.data || e?.message);
          // Continue trying next endpoint even if 401/400, stop only after all fail
        }
      }
      throw lastErr || new Error('Staff login failed');
    } catch (error: any) {
      console.error('Staff login error:', error?.response?.status, error?.response?.data || error?.message);
      throw error;
    }
  },

  // Register new customer
  register: async (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
  }) => {
    try {
      const res = await api.post('/customers/register', data);
      return res.data;
    } catch (error: any) {
      console.error('Register error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get customer profile
  getProfile: async (token: string) => {
    try {
      // Skip for non-customer roles to avoid 403 spam if called accidentally
      try {
        const decoded: any = decodeJwt(token);
        const role = decoded?.role || decoded?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        if (role && role.toLowerCase() !== 'customer') {
          console.log('⏭️ Skipping getProfile: role is not customer ->', role);
          return {} as any;
        }
      } catch {}
      // Primary endpoint - theo API documentation
      console.log('🔍 Fetching profile from primary endpoint: /customers/my-profile');
      const res = await api.get('/customers/my-profile', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      console.log('✅ Profile fetched successfully');
      return res.data;
    } catch (primaryError: any) {
      console.error('❌ Primary profile endpoint failed:', primaryError.response?.status, primaryError.response?.data || primaryError.message);
      
      // Nếu endpoint chính thất bại, thử các endpoint khác
      const alternativeEndpoints = [
        '/customers/profile',
        '/customers/me',
        '/customers/info',
      ];
      
      for (const endpoint of alternativeEndpoints) {
        try {
          console.log(`🔄 Trying alternative endpoint: ${endpoint}`);
          const res = await api.get(endpoint, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          });
          console.log(`✅ Profile fetched from alternative endpoint: ${endpoint}`);
          return res.data;
        } catch (e: any) {
          console.log(`❌ Alternative endpoint failed: ${endpoint} - ${e.response?.status}`);
        }
      }
      
      // Nếu tất cả endpoint đều thất bại, throw lỗi đầu tiên
      console.error('❌ All profile endpoints failed');
      throw primaryError;
    }
  },

  // Get staff profile (nếu cần)
  getStaffProfile: async (token: string) => {
    try {
      console.log('🔍 Fetching staff profile...');
      // Thử các endpoint có thể dành cho staff
      const staffEndpoints = [
        '/staffs/my-profile',
        '/staffs/profile',
        '/staffs/me',
      ];
      
      for (const endpoint of staffEndpoints) {
        try {
          console.log(`🔄 Trying staff endpoint: ${endpoint}`);
          const res = await api.get(endpoint, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          });
          console.log(`✅ Staff profile fetched from: ${endpoint}`);
          return res.data;
        } catch (e: any) {
          console.log(`❌ Staff endpoint failed: ${endpoint} - ${e.response?.status}`);
        }
      }
      
      // Nếu không có endpoint nào hoạt động, trả về null
      console.log('⚠️ No staff profile endpoints available');
      return null;
    } catch (error: any) {
      console.error('❌ Staff profile error:', error.response?.status, error.response?.data || error.message);
      return null;
    }
  },

  // Update customer profile
  updateProfile: async (
    token: string,
    data: { name: string; email: string; phone: string; address: string }
  ) => {
    try {
      console.log('🔍 Updating profile via POST /customers/my-profile');
      const res = await api.post('/customers/my-profile', data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Profile updated successfully');
      return res.data;
    } catch (error: any) {
      console.error('❌ Update profile error:', error.response?.status, error.response?.data || error.message);
      throw error;
    }
  },

  // Verify email
  verifyEmail: async (token: string) => {
    try {
      const res = await api.post('/customers/verify', { token });
      return res.data;
    } catch (error: any) {
      console.error('Verify email error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (email: string) => {
    try {
      const res = await api.post(`/customers/forgot-password?email=${email}`);
      return res.data;
    } catch (error: any) {
      console.error('Forgot password error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Reset password
  resetPassword: async (token: string, password: string) => {
    try {
      const res = await api.post('/customers/reset-password', { token, password });
      return res.data;
    } catch (error: any) {
      console.error('Reset password error:', error.response?.data || error.message);
      throw error;
    }
  },
};

// ===== PRODUCTS API =====
export const productsApi = {
  // Get all products - using the working endpoint from MenuScreen
  getAllProducts: async () => {
    try {
      console.log('📦 Fetching products from:', `${BASE_URL}/products`);
      const res = await api.get('/products');
      console.log('✅ Products response:', res.data);
      return res.data;
    } catch (error: any) {
      console.error('❌ Primary products endpoint failed:', error);
      console.error('Error details:', error.response?.data, error.response?.status);
      throw error;
    }
  },

  // Get product by ID
  getProductById: async (id: string | number) => {
    const res = await api.get(`/Product/get-product-by-id/${id}`);
    return res.data;
  },

  // Get coffee products
  getCoffeeProducts: async () => {
    const res = await api.get('/Product/get-coffee-product');
    return res.data;
  },

  // Get freeze products
  getFreezeProducts: async () => {
    const res = await api.get('/Product/get-freeze-product');
    return res.data;
  },

  // Get tea products
  getTeaProducts: async () => {
    const res = await api.get('/Product/get-tea-product');
    return res.data;
  },
};

// ===== CATEGORIES API =====
export const categoriesApi = {
  // Get all categories
  getAllCategories: async () => {
    const res = await api.get('/categories');
    return res.data;
  },

  // Get category by ID
  getCategoryById: async (id: string | number) => {
    const res = await api.get(`/categories/${id}`);
    return res.data;
  },
};

// ===== PLANS API =====
export const plansApi = {
  // Get all plans - using the working endpoint from Packages screen
  getAllPlans: async () => {
    const cacheKey = 'cached_plans_v1';
    const tryEndpoints = async (client: typeof api) => {
      const res = await client.get('/plans');
      return res.data;
    };

    // Iterate alternative base URLs with limited retries for 503/network errors
    let lastErr: any = null;
    for (const base of ALTERNATIVE_BASE_URLS) {
      const client = axios.create({ baseURL: base, timeout: 10000 });
      // copy interceptors behavior minimally: add auth header from AsyncStorage where possible
      client.interceptors.request.use(async (config) => {
        try {
          const token = await AsyncStorage.getItem('token');
          if (token && !config.headers?.Authorization) {
            (config.headers as any).Authorization = `Bearer ${token}`;
          }
        } catch {}
        return config;
      });

      const maxRetries = 2;
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          console.log(`📋 Fetching plans from: ${base} (attempt ${attempt + 1})`);
          const data = await tryEndpoints(client as any);
          // Cache and return
          try {
            await AsyncStorage.setItem(
              cacheKey,
              JSON.stringify({ ts: Date.now(), data })
            );
          } catch {}
          console.log('✅ Plans fetched');
          return data;
        } catch (err: any) {
          lastErr = err;
          const status = err?.response?.status;
          const isRetryable = status === 503 || status === 502 || status === 504 || err?.code === 'ECONNABORTED' || err?.message?.includes('Network');
          console.error('❌ Plans fetch failed:', status, err?.message);
          if (attempt < maxRetries && isRetryable) {
            const backoffMs = 400 * Math.pow(2, attempt);
            await new Promise(r => setTimeout(r, backoffMs));
            continue;
          }
          break;
        }
      }
    }

    // As a last resort, return cached data if available
    try {
      const cached = await AsyncStorage.getItem('cached_plans_v1');
      if (cached) {
        const parsed = JSON.parse(cached);
        console.log('♻️ Using cached plans');
        return parsed.data;
      }
    } catch {}

    throw lastErr || new Error('Unable to fetch plans');
  },

  // Get plan by ID
  getPlanById: async (id: number) => {
    try {
      const res = await api.get(`/plans/${id}`);
      return res.data;
    } catch (error: any) {
      // Fallback to alternative endpoint
      const res = await api.get(`/Plan/get-plan-by-id/${id}`);
      return res.data;
    }
  },

  // Alternative plan endpoints (if the above don't work)
  getAllPlansAlt: async () => {
    const res = await api.get('/Plan/get-all-plans');
    return res.data;
  },

  getPlanByIdAlt: async (id: string | number) => {
    const res = await api.get(`/Plan/get-plan-by-id/${id}`);
    return res.data;
  },
};

// ===== SUBSCRIPTIONS API =====
export const subscriptionsApi = {
  // Create subscription order
  createSubscriptionOrder: async (planId: number, token: string) => {
    try {
      const res = await api.post('/subscriptions', { planId }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      return res.data;
    } catch (error: any) {
      throw new Error(`Tạo đơn hàng thất bại: ${error.response?.status || 'Unknown'} - ${error.response?.data?.message || error.message}`);
    }
  },

  // Get user subscriptions
  getMySubscriptions: async (token: string) => {
    const res = await api.get('/subscriptions/my-subscriptions', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  // Check if subscription is active
  checkSubscriptionActive: async (planId: number, token: string) => {
    try {
      const res = await api.get('/subscriptions/my-subscriptions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const subs = res.data;
      return subs.some((sub: any) => sub.planId === planId && sub.status === "Active");
    } catch (err) {
      return false;
    }
  },

  // Handle payment callback
  handlePaymentCallback: async (callbackData: any) => {
    try {
      const res = await api.post('/subscriptions/payment-callback', callbackData, {
        headers: { 'Content-Type': 'application/json' }
      });
      return true;
    } catch (error: any) {
      throw new Error(`Payment callback failed: ${error.response?.status || 'Unknown'} - ${error.response?.data?.message || error.message}`);
    }
  },
};

// ===== ORDERS API =====
export const ordersApi = {
  // Get user orders
  getUserOrders: async (token: string) => {
    const res = await api.get('/orders/user-orders', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  // Create new order
  createOrder: async (orderData: any, token: string) => {
    const res = await api.post('/orders', orderData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: string, token: string) => {
    const res = await api.put(`/orders/${orderId}/status`, { status }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },
};

// ===== STAFF API =====
export const staffApi = {
  // Get staff orders
  getStaffOrders: async (token: string) => {
    const res = await api.get('/staff/orders', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  // Process order
  processOrder: async (orderId: string, action: 'accept' | 'reject', token: string) => {
    const res = await api.post(`/staff/orders/${orderId}/${action}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },
};

// ===== NOTIFICATIONS API =====
export const notificationsApi = {
  // Get all notifications of logged-in user
  getNotifications: async (token: string) => {
    const res = await api.get('/notifications', {
      headers: { Authorization: `Bearer ${token}`, Accept: '*/*' },
    });
    return res.data;
  },
  // Register device push token for a user (best-effort)
  registerDevice: async (userId: string, pushToken: string) => {
    try {
      const res = await api.post('/notifications/register-device', { userId, pushToken });
      return res.data;
    } catch (e: any) {
      try {
        const res = await api.post('/devices/register', { userId, pushToken });
        return res.data;
      } catch {
        // Endpoint not available → ignore silently
        return null;
      }
    }
  },
};

// ===== DEVICE / FCM API =====
// Device/FCM API removed per user's request

// ===== REDEEMS API (STAFF FLOW) =====
export const redeemsApi = {
  // Staff scan QR (phone) to get customer's subscriptions
  scanQr: async (phone: string) => {
    const res = await api.post('/redeems/scan-qr', { phone });
    return res.data; // array of subscriptions
  },

  // Staff redeem (checkout)
  redeem: async (subscriptionId: number, quantity: number = 1) => {
    const res = await api.post('/redeems/redeem', { subscriptionId, quantity });
    return res.data; // { success, message, redeemedAt, planName, productName, quantity }
  },
};

// ===== WALLET API =====
export const walletApi = {
  // Get wallet balance
  getWalletBalance: async (token: string) => {
    const res = await api.get('/wallet/balance', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  // Get transaction history
  getTransactionHistory: async (token: string) => {
    const res = await api.get('/wallet/transactions', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },
};

// ===== CONTACT API =====
export const contactApi = {
  // Send contact message
  sendMessage: async (messageData: {
    name: string;
    email: string;
    phone: string;
    message: string;
  }) => {
    const res = await api.post('/contact/send', messageData);
    return res.data;
  },
};

// Export all APIs
export default {
  auth: authApi,
  products: productsApi,
  categories: categoriesApi,
  plans: plansApi,
  subscriptions: subscriptionsApi,
  orders: ordersApi,
  staff: staffApi,
  notifications: notificationsApi,
  redeems: redeemsApi,
  wallet: walletApi,
  contact: contactApi,
};