import * as SecureStore from 'expo-secure-store';
import { Purchase, ContactMessage } from '../types';


export const useStorage = () => {
  const savePurchase = async (purchase: Purchase): Promise<void> => {
    try {
      const existingPurchases = await SecureStore.getItemAsync('purchases');
      const purchases: Purchase[] = existingPurchases ? JSON.parse(existingPurchases) : [];
      purchases.push(purchase);
      await SecureStore.setItemAsync('purchases', JSON.stringify(purchases));
    } catch (error) {
      console.error('Error saving purchase:', error);
    }
  };

  const getPurchases = async (): Promise<Purchase[]> => {
    try {
      const purchases = await SecureStore.getItemAsync('purchases');
      return purchases ? JSON.parse(purchases) : [];
    } catch (error) {
      console.error('Error getting purchases:', error);
      return [];
    }
  };

  const saveContactMessage = async (message: ContactMessage): Promise<void> => {
    try {
      const existingMessages = await SecureStore.getItemAsync('contactMessages');
      const messages: ContactMessage[] = existingMessages ? JSON.parse(existingMessages) : [];
      messages.push(message);
      await SecureStore.setItemAsync('contactMessages', JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving contact message:', error);
    }
  };

  const getContactMessages = async (): Promise<ContactMessage[]> => {
    try {
      const messages = await SecureStore.getItemAsync('contactMessages');
      return messages ? JSON.parse(messages) : [];
    } catch (error) {
      console.error('Error getting contact messages:', error);
      return [];
    }
  };

  return {
    savePurchase,
    getPurchases,
    saveContactMessage,
    getContactMessages,
  };
};