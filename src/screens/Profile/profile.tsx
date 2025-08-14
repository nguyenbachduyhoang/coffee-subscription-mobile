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
import { useStorage } from '../../hooks/useStorage';
import { AuthModal } from '../../components/AuthModal';
import { Purchase } from '../../types';
import { Gift, Phone } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

type ProfileStackParamList = {
  Benefits: undefined;
  Contact: undefined;
  // Add other routes if needed
};

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { getPurchases } = useStorage();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const navigation = useNavigation<StackNavigationProp<ProfileStackParamList>>();

  useEffect(() => {
    if (user) {
      loadPurchases();
    }
  }, [user]);

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
        { text: 'Đăng Xuất', onPress: logout, style: 'destructive' },
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.guestContainer}>
          <UserIcon size={64} color={Colors.gray[400]} />
          <Text style={styles.guestTitle}>Chưa Đăng Nhập</Text>
          <Text style={styles.guestSubtitle}>
            Đăng nhập để xem thông tin cá nhân và lịch sử mua hàng
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
          onClose={() => setShowAuthModal(false)}
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
        <View style={styles.sectionHeader}>
          <ShoppingBag size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Lịch Sử Mua Hàng</Text>
        </View>
        
        {purchases.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
          </View>
        ) : (
          <View style={styles.purchasesList}>
            {purchases.map((purchase) => (
              <View key={purchase.id} style={styles.purchaseCard}>
                <View style={styles.purchaseHeader}>
                  <Text style={styles.purchaseName}>{purchase.packageName}</Text>
                  <Text style={styles.purchasePrice}>
                    {purchase.price.toLocaleString('vi-VN')}₫
                  </Text>
                </View>
                
                <View style={styles.purchaseDetails}>
                  <Text style={styles.purchaseMethod}>
                    Phương thức: {purchase.paymentMethod === 'momo' ? 'MoMo' : 'COD'}
                  </Text>
                  <Text style={styles.purchaseDate}>
                    {new Date(purchase.date).toLocaleDateString('vi-VN')}
                  </Text>
                </View>
                
                <View style={[
                  styles.statusBadge,
                  purchase.status === 'completed' && styles.statusCompleted
                ]}>
                  <Text style={[
                    styles.statusText,
                    purchase.status === 'completed' && styles.statusTextCompleted
                  ]}>
                    {purchase.status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
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
    ...Shadows.medium,
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
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.primary,
    marginLeft: 8,
  },
  emptyState: {
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: Colors.gray[500],
  },
  purchasesList: {
    gap: 12,
  },
  purchaseCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    ...Shadows.small,
  },
  purchaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  purchaseName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.primary,
  },
  purchasePrice: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: Colors.primary,
  },
  purchaseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  purchaseMethod: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: Colors.gray[600],
  },
  purchaseDate: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: Colors.gray[600],
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.gray[100],
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusCompleted: {
    backgroundColor: Colors.success,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    color: Colors.gray[600],
  },
  statusTextCompleted: {
    color: Colors.white,
  },
  actionsSection: {
    padding: 20,
    gap: 12,
    paddingBottom: 100,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    ...Shadows.small,
  },
  actionText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: Colors.primary,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    ...Shadows.small,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: Colors.error,
    marginLeft: 12,
  },
});