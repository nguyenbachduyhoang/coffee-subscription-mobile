import { notificationsApi as api } from './api';

export interface AppNotification {
  notificationId: number;
  customerId: number;
  title: string;
  body: string;
  type: string;
  createdAt: string;
  status: 'Unread' | 'Read' | string;
}

export const notificationApi = {
  getNotifications: api.getNotifications,
};
