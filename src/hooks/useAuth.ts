import { useState, useEffect, createContext, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { authApi } from '../services/api';
import { decodeJwt } from './jwtDecode';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginStaff: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (user: Partial<User>) => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const useAuthLogic = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const userData = await SecureStore.getItemAsync('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        console.log('Loaded user from storage:', parsedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Gọi API đăng nhập thực tế cho customer
      const token = await authApi.loginCustomer(email, password);
      
      if (!token) {
        throw new Error('Token không được trả về từ server');
      }

      const decoded = decodeJwt(token) as { sub?: string; name?: string; phone?: string; role?: string };

      const baseUserData: User = {
        id: decoded.sub || Date.now().toString(),
        email,
        name: decoded.name || email.split('@')[0],
        phone: decoded.phone || '',
        role: decoded.role || 'customer',
        token,
      };

      // Fetch profile to ensure we have latest phone number
      let finalUserData: User = baseUserData;
      try {
        // Chỉ customer mới cần fetch profile
        if (decoded.role === 'customer') {
          const profile: any = await authApi.getProfile(token);
          const phoneFromProfile = profile?.phone || profile?.data?.phone || profile?.phoneNumber || '';
          const nameFromProfile = profile?.name || profile?.fullName || '';
          finalUserData = {
            ...baseUserData,
            phone: phoneFromProfile || baseUserData.phone,
            name: nameFromProfile || baseUserData.name,
          };
        } else {
          console.log('⚠️ Skipping profile fetch for staff/barista user');
          finalUserData = baseUserData;
        }
      } catch (e) {
        console.log('Get profile after login failed, using token data only');
        finalUserData = baseUserData;
      }

      await SecureStore.setItemAsync('user', JSON.stringify(finalUserData));
      // Also keep a copy of token in AsyncStorage for interceptors
      try { await AsyncStorage.setItem('token', token); } catch {}
      setUser(finalUserData);
      console.log('Customer login successful:', finalUserData);
      return true;
    } catch (error: any) {
      console.error('Customer login error:', error.response?.data || error.message);
      
      // Fallback cho development/testing
      if (__DEV__) {
        console.log('Using fallback login for development');
        const userData: User = {
          id: Date.now().toString(),
          email,
          name: email.split('@')[0],
          phone: '',
          role: 'customer',
          token: 'dev-token-' + Date.now(),
        };
        
        await SecureStore.setItemAsync('user', JSON.stringify(userData));
        try { await AsyncStorage.setItem('token', userData.token!); } catch {}
        setUser(userData);
        return true;
      }
      
      return false;
    }
  };

  const loginStaff = async (email: string, password: string): Promise<boolean> => {
    try {
      const token = await authApi.loginStaff(email, password);
      
      if (!token) {
        throw new Error('Token không được trả về từ server');
      }

      const decoded = decodeJwt(token) as { sub?: string; name?: string; phone?: string; role?: string };
      
      const userData: User = {
        id: decoded.sub || email,
        email,
        name: decoded.name || email.split('@')[0],
        phone: decoded.phone || '',
        role: decoded.role || 'staff',
        token,
      };

      await SecureStore.setItemAsync('user', JSON.stringify(userData));
      // Also keep a copy of token in AsyncStorage for interceptors
      try { await AsyncStorage.setItem('token', token); } catch {}
      setUser(userData);
      console.log('Staff login successful:', userData);
      return true;
    } catch (error: any) {
      console.error('Staff login error:', error.response?.data || error.message);
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      // Gọi API đăng ký thực tế
      const result = await authApi.register({
        email,
        password,
        name,
        phone: '',
        address: ''
      });

      const token = result.token || result.access_token;
      
      if (token) {
        const decoded = decodeJwt(token) as { sub?: string; name?: string; phone?: string; role?: string };
        const userData: User = {
          id: decoded.sub || Date.now().toString(),
          email,
          name,
          phone: '',
          role: 'customer',
          token,
        };
        
        await SecureStore.setItemAsync('user', JSON.stringify(userData));
        setUser(userData);
      } else {
        // Nếu không có token (có thể cần verify email trước)
        const userData: User = {
          id: Date.now().toString(),
          email,
          name,
          phone: '',
          role: 'customer',
        };
        
        await SecureStore.setItemAsync('user', JSON.stringify(userData));
        setUser(userData);
      }
      
      console.log('Registration successful');
      return true;
    } catch (error: any) {
      console.error('Register error:', error.response?.data || error.message);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync('user');
      try {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('last_notification_id');
      } catch {}
      setUser(null);
      console.log('User logged out');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (updatedUser: Partial<User>): Promise<void> => {
    try {
      if (!user) return;

      const newUser = { ...user, ...updatedUser };
      await SecureStore.setItemAsync('user', JSON.stringify(newUser));
      setUser(newUser);
      console.log('Profile updated:', newUser);
    } catch (error) {
      console.error('Update profile error:', error);
    }
  };

  return {
    user,
    isLoading,
    login,
    loginStaff,
    register,
    logout,
    updateProfile,
    setUser,
  };
};

export { AuthContext };