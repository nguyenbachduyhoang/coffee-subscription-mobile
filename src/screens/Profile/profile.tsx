import React, { useState, useEffect } from 'react';
// Màn hình này được sử dụng cho tab "Cá Nhân" (profile) trong thanh điều hướng chính.
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { User as UserIcon, LogOut, ShoppingBag, Settings, CreditCard as Edit3 } from 'lucide-react-native';
import { Colors, Shadows } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';
import { getProfile } from '../../services/authApi';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStorage } from '../../hooks/useStorage';
import { AuthModal } from '../../components/AuthModal';
import { Purchase } from '../../types';
import { Gift, Phone } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

type ProfileStackParamList = {
  Benefits: undefined;
  Contact: undefined;
  HistoryScreen: undefined;
  // Add other routes if needed
};

export default function ProfileScreen() {
  const { logout, user: authUser, setUser: setCtxUser } = useAuth();
  const [user, setUser] = useState<any>(null);
  const { getPurchases } = useStorage();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [reloadProfile, setReloadProfile] = useState(false);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const navigation = useNavigation<StackNavigationProp<ProfileStackParamList>>();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Ưu tiên dùng user từ context (đã có token và phone sau login)
        if (authUser) {
          setUser(authUser);
          try { await SecureStore.setItemAsync('user', JSON.stringify(authUser)); } catch {}
        }

        // Chỉ gọi API với role customer và có token
        const token = authUser?.token || (await AsyncStorage.getItem('token')) || '';
        const role = authUser?.role || 'customer';
        
        // Nếu không có token, không gọi API và để user = null (hiển thị guest mode)
        if (!token) {
          console.log('⚠️ No token found - showing guest mode');
          setUser(null);
          return;
        }
        
        // Staff/barista không cần gọi customer profile API
        if (role === 'staff' || role === 'barista') {
          console.log('⚠️ Skipping profile API call - user is staff/barista, using context data');
          console.log('👤 User role:', role, 'Email:', authUser?.email);
          // Staff sử dụng data từ context, không cần gọi API
          if (authUser) {
            setUser(authUser);
            try { await SecureStore.setItemAsync('user', JSON.stringify(authUser)); } catch {}
          }
          loadPurchases();
          return;
        }
        
        // Chỉ customer mới gọi profile API
        if (role !== 'customer') {
          console.log('⚠️ Skipping profile API call - unknown role:', role);
          return;
        }

        try {
          console.log('🔍 Fetching customer profile...');
          const profile = await getProfile(token);
          setUser(profile);
          // Lưu lại user vào SecureStore để QRCode lấy đúng số điện thoại
          try { await SecureStore.setItemAsync('user', JSON.stringify(profile)); } catch {}
        } catch (error) {
          console.log('Error fetching profile:', error);
          // Fallback: nếu context có user thì giữ nguyên, nếu không thì để null
          if (!authUser) {
            setUser(null);
          }
        }

        loadPurchases();
      } catch (e) {
        console.log('Unexpected error in fetchProfile:', e);
        // Fallback to context user if available
        if (authUser) {
          setUser(authUser);
        } else {
          setUser(null);
        }
      }
    };
    fetchProfile();
  }, [reloadProfile, authUser]);

  const loadPurchases = async () => {
    const userPurchases = await getPurchases();
    setPurchases(userPurchases);
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng Xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng Xuất', onPress: async () => {
            try {
              await AsyncStorage.removeItem('token');
              try { await SecureStore.deleteItemAsync('user'); } catch {}
            } finally {
              setUser(null);
              try { setCtxUser && setCtxUser(null as any); } catch {}
              setReloadProfile(r => !r);
              if (logout) await logout();
            }
          }, style: 'destructive' },
      ]
    );
  };

  const handleRemoveToken = async () => {
    try {
      await AsyncStorage.removeItem('token');
      Alert.alert('Thành công', 'Token đã được xóa');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể xóa token');
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.guestContainer}>
          <UserIcon size={64} color={Colors.gray[400]} />
          <Text style={styles.guestTitle}>Chưa Đăng Nhập</Text>
          <Text style={styles.guestSubtitle}>
            Đăng nhập để xem thông tin cá nhân, lịch sử mua hàng và sử dụng QR code
          </Text>
          
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => setShowAuthModal(true)}
          >
            <Text style={styles.loginButtonText}>Đăng Nhập</Text>
          </TouchableOpacity>
        </View>

        <AuthModal
          visible={showAuthModal}
          onClose={() => {
            setShowAuthModal(false);
            setReloadProfile(r => !r);
          }}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cá Nhân</Text>
      </View>

      {/* User Info */}
      <View style={styles.userSection}>
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <UserIcon size={32} color={Colors.primary} />
          </View>
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
          
          <TouchableOpacity style={styles.editButton}>
            <Edit3 size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Purchase History */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('HistoryScreen')}
          activeOpacity={0.7}
        >
          <ShoppingBag size={20} color={Colors.primary} />
          <Text style={styles.actionText}>Lịch Sử Mua Hàng</Text>
        </TouchableOpacity>
      </View>

      {/* Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Benefits')}>
          <Gift size={20} color={Colors.primary} />
          <Text style={styles.actionText}>Lợi Ích</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Contact')}>
          <Phone size={20} color={Colors.primary} />
          <Text style={styles.actionText}>Liên Hệ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Settings size={20} color={Colors.primary} />
          <Text style={styles.actionText}>Cài Đặt</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Đăng Xuất</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: Colors.primary,
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  guestTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  guestSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: Colors.gray[600],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  userSection: {
    padding: 20,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.primary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: Colors.gray[600],
  },
  editButton: {
    padding: 8,
  },
  section: {
    padding: 20,
    paddingBottom: 0,
  },
  actionsSection: {
    padding: 20,
    gap: 16,
    paddingBottom: 100,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 0,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 0,
  },
  actionText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: Colors.primary,
    marginLeft: 12,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: Colors.error,
    marginLeft: 12,
  },
});