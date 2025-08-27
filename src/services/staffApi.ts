import { authApi, redeemsApi } from './api';

export const staffAuth = {
  login: authApi.loginStaff,
};

export interface ScannedSubscription {
  subscriptionId: number;
  planName: string;
  endDate: string | null;
  remainingDays: number | null;
  status: 'Active' | 'PendingPayment' | 'Cancelled' | string;
  productName: string;
}

export const staffRedeem = {
  scanQr: (phone: string): Promise<ScannedSubscription[]> => redeemsApi.scanQr(phone),
  redeem: (subscriptionId: number, quantity: number = 1): Promise<{
    success: boolean;
    message: string;
    redeemedAt: string;
    planName: string;
    productName: string;
    quantity: number;
  }> => redeemsApi.redeem(subscriptionId, quantity),
};


