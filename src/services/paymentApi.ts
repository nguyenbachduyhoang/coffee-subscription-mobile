import { subscriptionsApi as api } from './api';

export interface SubscriptionOrderResponse {
  qrUrl: string; // URL ảnh QR code thanh toán
  bankName: string; // Tên ngân hàng
  bankAccount: string; // Số tài khoản
  accountHolder: string; // Chủ tài khoản
  transferContent: string; // Nội dung chuyển khoản
  amount: number; // Số tiền
  // Thêm các field có thể có từ API response
  id?: number;
  planId?: number;
  status?: string;
  data?: any; // Additional data from API
  message?: string; // Success message
}

export interface PaymentCallbackRequest {
  id: number;
  gateway: string;
  transactionDate: string;
  accountNumber: string;
  content: string;
  transferType: string;
  transferAmount: number;
  accumulated: number;
  code: string;
  referenceCode: string;
  description: string;
}

export async function createSubscriptionOrder(planId: number, token: string): Promise<SubscriptionOrderResponse> {
  return api.createSubscriptionOrder(planId, token);
}

export async function handlePaymentCallback(callbackData: PaymentCallbackRequest): Promise<boolean> {
  return api.handlePaymentCallback(callbackData);
}