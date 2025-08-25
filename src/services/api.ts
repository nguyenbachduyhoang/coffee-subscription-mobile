import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://minhkhoi02-001-site1.anytempurl.com/api';

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
      // Add auth token if available (React Native compatible)
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Token added to request');
      } else {
        console.log('❌ No token found in storage');
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
    console.error('❌ API Error:', error.response?.status, error.config?.url);
    console.error('Error details:', error.response?.data);
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.log('🚫 Unauthorized access, redirecting to login');
    }
    return Promise.reject(error);
  }
);

// ===== AUTHENTICATION API =====
export const authApi = {
  // Customer authentication
  loginCustomer: async (email: string, password: string) => {
    try {
      console.log('Attempting customer login for:', email);
      console.log('Login URL:', `${BASE_URL}/customers/login`);
      const res = await api.post('/customers/login', { email, password }, {
        headers: { 'Accept': '*/*', 'Content-Type': 'application/json' },
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
      const res = await api.post('/Staff/login', { email, password }, {
        headers: { 'Accept': '*/*', 'Content-Type': 'application/json' },
        responseType: 'text'
      });
      return res.data;
    } catch (error: any) {
      console.error('Staff login error:', error.response?.data || error.message);
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
      const res = await api.get('/customers/my-profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    } catch (error: any) {
      console.error('Get profile error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update customer profile
  updateProfile: async (
    token: string,
    data: { name: string; email: string; phone: string; address: string }
  ) => {
    try {
      const res = await api.post('/customers/update-profile', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    } catch (error: any) {
      console.error('Update profile error:', error.response?.data || error.message);
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
      
      // Try alternative endpoints
      try {
        console.log('🔄 Trying alternative endpoint: /Product/get-all-products');
        const res = await api.get('/Product/get-all-products');
        console.log('✅ Alternative products endpoint working:', res.data);
        return res.data;
      } catch (fallbackError: any) {
        console.error('❌ Alternative products endpoint also failed:', fallbackError);
        console.error('Fallback error details:', fallbackError.response?.data, fallbackError.response?.status);
        throw error; // Throw the original error
      }
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
    const res = await api.get('/Category/get-all-category');
    return res.data;
  },

  // Get category by ID
  getCategoryById: async (id: string | number) => {
    const res = await api.get(`/Category/get-category-by-id/${id}`);
    return res.data;
  },
};

// ===== PLANS API =====
export const plansApi = {
  // Get all plans - using the working endpoint from Packages screen
  getAllPlans: async () => {
    try {
      console.log('📋 Fetching plans from:', `${BASE_URL}/plans`);
      const res = await api.get('/plans');
      console.log('✅ Plans response:', res.data);
      return res.data;
    } catch (error: any) {
      console.error('❌ Primary plans endpoint failed:', error);
      console.error('Error details:', error.response?.data, error.response?.status);
      // Fallback to alternative endpoint
      try {
        console.log('🔄 Trying fallback endpoint:', `${BASE_URL}/Plan/get-all-plans`);
        const res = await api.get('/Plan/get-all-plans');
        console.log('✅ Fallback plans response:', res.data);
        return res.data;
      } catch (fallbackError: any) {
        console.error('❌ Fallback endpoint also failed:', fallbackError);
        console.error('Fallback error details:', fallbackError.response?.data, fallbackError.response?.status);
        throw error;
      }
    }
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
  // Get user notifications
  getUserNotifications: async (token: string) => {
    const res = await api.get('/notifications/user', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  // Mark notification as read
  markAsRead: async (notificationId: string, token: string) => {
    const res = await api.put(`/notifications/${notificationId}/read`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
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
  wallet: walletApi,
  contact: contactApi,
};