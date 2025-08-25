# API Services Documentation

## Tổng quan
Tất cả API calls trong project đã được tập trung vào các service files để dễ quản lý và bảo trì.

## Cấu trúc Services

### 1. `api.ts` - Centralized API Service
File chính chứa tất cả API calls, được tổ chức theo từng module:

#### Authentication API (`authApi`)
```typescript
import { authApi } from './api';

// Customer login
const token = await authApi.loginCustomer(email, password);

// Staff login
const token = await authApi.loginStaff(email, password);

// Register
const result = await authApi.register({ name, email, password, phone, address });

// Get profile
const profile = await authApi.getProfile(token);

// Update profile
await authApi.updateProfile(token, { name, email, phone, address });

// Verify email
await authApi.verifyEmail(token);

// Forgot password
await authApi.forgotPassword(email);

// Reset password
await authApi.resetPassword(token, newPassword);
```

#### Products API (`productsApi`)
```typescript
import { productsApi } from './api';

// Get all products
const products = await productsApi.getAllProducts();

// Get product by ID
const product = await productsApi.getProductById(id);

// Get coffee products
const coffeeProducts = await productsApi.getCoffeeProducts();

// Get freeze products
const freezeProducts = await productsApi.getFreezeProducts();

// Get tea products
const teaProducts = await productsApi.getTeaProducts();
```

#### Categories API (`categoriesApi`)
```typescript
import { categoriesApi } from './api';

// Get all categories
const categories = await categoriesApi.getAllCategories();

// Get category by ID
const category = await categoriesApi.getCategoryById(id);
```

#### Plans API (`plansApi`)
```typescript
import { plansApi } from './api';

// Get all plans
const plans = await plansApi.getAllPlans();

// Get plan by ID
const plan = await plansApi.getPlanById(id);

// Alternative endpoints
const plansAlt = await plansApi.getAllPlansAlt();
const planAlt = await plansApi.getPlanByIdAlt(id);
```

#### Subscriptions API (`subscriptionsApi`)
```typescript
import { subscriptionsApi } from './api';

// Create subscription order
const order = await subscriptionsApi.createSubscriptionOrder(planId, token);

// Get user subscriptions
const subscriptions = await subscriptionsApi.getMySubscriptions(token);

// Check if subscription is active
const isActive = await subscriptionsApi.checkSubscriptionActive(planId, token);

// Handle payment callback
await subscriptionsApi.handlePaymentCallback(callbackData);
```

#### Orders API (`ordersApi`)
```typescript
import { ordersApi } from './api';

// Get user orders
const orders = await ordersApi.getUserOrders(token);

// Create new order
const order = await ordersApi.createOrder(orderData, token);

// Update order status
await ordersApi.updateOrderStatus(orderId, status, token);
```

#### Staff API (`staffApi`)
```typescript
import { staffApi } from './api';

// Get staff orders
const orders = await staffApi.getStaffOrders(token);

// Process order
await staffApi.processOrder(orderId, 'accept', token);
await staffApi.processOrder(orderId, 'reject', token);
```

#### Notifications API (`notificationsApi`)
```typescript
import { notificationsApi } from './api';

// Get user notifications
const notifications = await notificationsApi.getUserNotifications(token);

// Mark notification as read
await notificationsApi.markAsRead(notificationId, token);
```

#### Wallet API (`walletApi`)
```typescript
import { walletApi } from './api';

// Get wallet balance
const balance = await walletApi.getWalletBalance(token);

// Get transaction history
const transactions = await walletApi.getTransactionHistory(token);
```

#### Contact API (`contactApi`)
```typescript
import { contactApi } from './api';

// Send contact message
await contactApi.sendMessage({ name, email, phone, message });
```

### 2. Legacy Service Files (Đã được cập nhật)
Các service files cũ vẫn được giữ lại để tương thích ngược, nhưng giờ đây chúng chỉ là wrapper cho centralized API:

- `authApi.ts` - Re-exports từ `api.ts`
- `packageApi.ts` - Re-exports từ `api.ts`
- `productApi.ts` - Re-exports từ `api.ts`
- `paymentApi.ts` - Re-exports từ `api.ts`

## Cách sử dụng

### Import trực tiếp từ centralized API
```typescript
import { authApi, productsApi, plansApi } from '../services/api';

// Sử dụng
const token = await authApi.loginCustomer(email, password);
const products = await productsApi.getAllProducts();
const plans = await plansApi.getAllPlans();
```

### Import từ legacy service files (để tương thích)
```typescript
import { login, register } from '../services/authApi';
import { getAllPlans } from '../services/packageApi';
import { getAllProducts } from '../services/productApi';

// Sử dụng
const token = await login.customer(email, password);
const plans = await getAllPlans();
const products = await getAllProducts();
```

## Lợi ích của việc tập trung hóa

1. **Dễ bảo trì**: Tất cả API calls ở một nơi
2. **Tái sử dụng**: Có thể dùng chung cho nhiều components
3. **Error handling**: Xử lý lỗi tập trung
4. **Type safety**: TypeScript interfaces được định nghĩa rõ ràng
5. **Testing**: Dễ dàng mock API calls cho testing
6. **Configuration**: Cấu hình base URL và interceptors tập trung

## Error Handling
Tất cả API calls đều có error handling built-in. Nếu có lỗi, chúng sẽ throw Error với message mô tả chi tiết.

## Authentication
API service tự động thêm Authorization header với Bearer token nếu có. Token được lấy từ AsyncStorage (React Native compatible).

## Base URL
Tất cả API calls đều sử dụng base URL: `http://minhkhoi02-001-site1.anytempurl.com/api`
