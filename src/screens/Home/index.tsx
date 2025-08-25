import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Dimensions, Modal, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Coffee, ArrowRight } from 'lucide-react-native';
import { Colors, Shadows } from '../../constants/colors';
import { getAllPlans, Plan } from '../../services/packageApi';
import { createSubscriptionOrder, SubscriptionOrderResponse } from '../../services/paymentApi';
import { productsApi } from '../../services/api';
import ProductCard from '../../components/ProductCard';
import { PackageCard } from '../../components/PackageCard';
import { AuthModal } from '../../components/AuthModal';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import { Package } from '../../types';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();
  const navigation = useNavigation();

  const [featuredPackages, setFeaturedPackages] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Thêm state cho modal thanh toán
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentData, setPaymentData] = useState<SubscriptionOrderResponse | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);

  const handlePackageSelect = async (pkg: Package) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    try {
      setOrderLoading(true);
      // Gọi API tạo đơn hàng/subscription
      const paymentInfo = await createSubscriptionOrder(Number(pkg.id), user.token!);
      setPaymentData(paymentInfo);
      setPaymentModalVisible(true);
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể tạo đơn hàng');
    } finally {
      setOrderLoading(false);
    }
  };

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch plans
        const plansData = await getAllPlans();
        setFeaturedPackages(plansData.slice(0, 2));
        setLoading(false);
        
        // Fetch products
        const productsData = await productsApi.getAllProducts();
        setProducts(productsData.slice(0, 4));
        setProductsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
        setProductsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <LinearGradient
        colors={[Colors.primary, '#6B4C49']}
        style={styles.hero}
      >
        <View style={styles.heroContent}>
          <Coffee size={48} color={Colors.secondary} />
          <Text style={styles.heroTitle}>
            Cà Phê Subscription{'\n'}Premium
          </Text>
          <Text style={styles.heroSubtitle}>
            Thưởng thức cà phê tươi mỗi ngày với gói đăng ký tiết kiệm
          </Text>
          
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => !user ? setShowAuthModal(true) : (navigation as any).navigate('Packages')}
          >
            <Text style={styles.ctaButtonText}>Đăng Ký Ngay</Text>
            <ArrowRight size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        
        <Image
          source={{ uri: 'https://images.pexels.com/photos/1251175/pexels-photo-1251175.jpeg?auto=compress&cs=tinysrgb&w=800' }}
          style={styles.heroImage}
        />
      </LinearGradient>

      {/* Welcome Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {user ? `Chào mừng, ${user.name}!` : 'Chào Mừng Đến Coffee Club'}
        </Text>
        <Text style={styles.sectionSubtitle}>
          Khám phá những gói cà phê subscription phù hợp với bạn
        </Text>
      </View>

      {/* Featured Packages */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Gói Nổi Bật</Text>
          <TouchableOpacity onPress={() => (navigation as any).navigate('Packages')}>
            <Text style={styles.viewAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <Text style={{ textAlign: 'center', color: Colors.primary, marginVertical: 16 }}>Đang tải...</Text>
        ) : (
          featuredPackages.map((plan) => (
            <PackageCard
              key={plan.planId}
              package={{
                id: String(plan.planId),
                name: plan.name,
                price: plan.price,
                image: plan.imageUrl,
                cupsPerDay: plan.dailyQuota,
                duration: String(plan.durationDays),
                benefits: [],
                popular: false,
              }}
              onSelect={() => handlePackageSelect({
                id: String(plan.planId),
                name: plan.name,
                price: plan.price,
                image: plan.imageUrl,
                cupsPerDay: plan.dailyQuota,
                duration: String(plan.durationDays),
                benefits: [],
                popular: false,
              })}
            />
          ))
        )}
      </View>

      {/* Menu Preview Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Menu Sản Phẩm</Text>
          <TouchableOpacity onPress={() => (navigation as any).navigate('MenuScreen')}>
            <Text style={styles.viewAllText}>Xem tất cả sản phẩm</Text>
          </TouchableOpacity>
        </View>
        {productsLoading ? (
          <Text style={{ textAlign: 'center', color: Colors.primary, marginVertical: 16 }}>Đang tải...</Text>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {products.map((product) => (
              <ProductCard key={product.productId} product={product} />
            ))}
          </View>
        )}
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <LinearGradient
          colors={[Colors.secondary, Colors.accent]}
          style={styles.statsContainer}
        >
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>1000+</Text>
              <Text style={styles.statLabel}>Khách hàng hài lòng</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>50+</Text>
              <Text style={styles.statLabel}>Loại cà phê</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>24/7</Text>
              <Text style={styles.statLabel}>Hỗ trợ khách hàng</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>100%</Text>
              <Text style={styles.statLabel}>Cà phê tươi</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Modal thanh toán QR */}
      <Modal visible={paymentModalVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Quét mã QR để thanh toán</Text>
            {paymentData && (
              <>
                <Image source={{ uri: paymentData.qrUrl }} style={{ width: 200, height: 200, alignSelf: 'center', marginBottom: 16 }} />
                <Text>Ngân hàng: <Text style={{ fontWeight: 'bold' }}>{paymentData.bankName}</Text></Text>
                <Text>Số tài khoản: <Text style={{ fontWeight: 'bold' }}>{paymentData.bankAccount}</Text></Text>
                <Text>Chủ tài khoản: <Text style={{ fontWeight: 'bold' }}>{paymentData.accountHolder}</Text></Text>
                <Text>Nội dung chuyển khoản: <Text style={{ fontWeight: 'bold' }}>{paymentData.transferContent}</Text></Text>
                <Text>Số tiền: <Text style={{ fontWeight: 'bold' }}>{paymentData.amount?.toLocaleString()} đ</Text></Text>
              </>
            )}
            <TouchableOpacity onPress={() => setPaymentModalVisible(false)} style={styles.closeBtn}>
              <Text style={{ color: Colors.primary, fontWeight: 'bold', fontSize: 16 }}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  hero: {
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  heroContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  heroImage: {
    position: 'absolute',
    right: -50,
    bottom: -20,
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.3,
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: Colors.white,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: Colors.secondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  ctaButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 25,
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ctaButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.primary,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: Colors.gray[600],
    marginTop: 4,
    lineHeight: 20,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: Colors.primary,
  },
  statsSection: {
    padding: 20,
    paddingBottom: 40,
  },
  statsContainer: {
    borderRadius: 16,
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: Colors.gray[700],
    textAlign: 'center',
    marginTop: 4,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  closeBtn: {
    marginTop: 24,
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
});