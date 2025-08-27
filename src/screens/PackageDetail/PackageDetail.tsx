import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Coffee,
  Calendar,
  Clock,
  CheckCircle,
  Star,
  ShoppingCart,
  QrCode,
} from 'lucide-react-native';
import { Colors, Shadows } from '../../constants/colors';
import { Plan } from '../../services/packageApi';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { AuthModal } from '../../components/AuthModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { subscriptionsApi } from '../../services/api';

const { height } = Dimensions.get('window');
const HEADER_HEIGHT = height * 0.32;

type RouteParams = {
  plan: Plan;
};

const PackageDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { plan } = route.params as RouteParams;
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          setSubscriptions([]);
          return;
        }
        
        const data = await subscriptionsApi.getMySubscriptions(token);
        if (data && Array.isArray(data)) {
          setSubscriptions(data);
        } else {
          setSubscriptions([]);
        }
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
        setSubscriptions([]);
      }
    };
    
    if (user) {
      fetchSubscriptions();
    } else {
      setSubscriptions([]);
    }
  }, [user]);

  const handleBack = () => navigation.goBack();

  const handleRegister = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      setOrderLoading(true);
      (navigation as any).navigate('PaymentScreen', { planId: plan.planId });
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setOrderLoading(false);
    }
  };

  const formatPrice = (price: number) => price.toLocaleString('vi-VN');

  const getSuccessCount = (planId: number) => {
    if (!Array.isArray(subscriptions)) return 0;
    return subscriptions.filter(
      sub => sub.planId === planId && sub.status === 'Active'
    ).length;
  };

  const successCount = getSuccessCount(plan.planId);
  const isAlreadySubscribed = successCount > 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Image source={{ uri: plan.imageUrl }} style={styles.headerImage} resizeMode="cover" />
        
        <LinearGradient 
          colors={['transparent', 'rgba(0,0,0,0.5)']} 
          style={styles.headerOverlay} 
        />

        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <View style={styles.backButtonBg}>
            <ArrowLeft size={18} color={Colors.primary} />
          </View>
        </TouchableOpacity>

        {/* Success badge if already subscribed */}
        {isAlreadySubscribed && (
          <View style={styles.successBadge}>
            <Text style={styles.successBadgeText}>Đã đăng ký {successCount} lần</Text>
          </View>
        )}
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <Text style={styles.packageName}>{plan.name}</Text>
          
          <View style={styles.priceSection}>
            <Text style={styles.priceMainText}>{formatPrice(plan.price)}₫</Text>
            <Text style={styles.priceUnit}>/{plan.durationDays} ngày</Text>
          </View>

          {/* Simple meta info */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Số ly/ngày</Text>
              <Text style={styles.metaValue}>{plan.dailyQuota}</Text>
            </View>
            
            <View style={styles.metaDivider} />
            
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Thời hạn</Text>
              <Text style={styles.metaValue}>{plan.durationDays} ngày</Text>
            </View>
            
            <View style={styles.metaDivider} />
            
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Tối đa/lần</Text>
              <Text style={styles.metaValue}>{plan.maxPerVisit}</Text>
            </View>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.descriptionSection}>
          <Text style={styles.descriptionText}>{plan.description}</Text>
        </View>

        {/* Product Details */}
        <View style={styles.productSection}>
          <Text style={styles.sectionTitle}>Chi Tiết Sản Phẩm</Text>
          <View style={styles.productCard}>
            <Image source={{ uri: plan.imageUrl }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{plan.productName}</Text>
              <Text style={styles.productDescription}>
                Hương vị cà phê Việt Nam đậm đà, được pha chế từ những hạt cà phê chất lượng cao.
              </Text>
            </View>
          </View>
        </View>

        {/* How It Works */}
        <View style={styles.howItWorksSection}>
          <Text style={styles.sectionTitle}>Cách Thức Hoạt Động</Text>
          
          <View style={styles.stepsContainer}>
            <View style={styles.step}>
              <View style={styles.stepIcon}>
                <ShoppingCart size={24} color={Colors.primary} />
              </View>
              <Text style={styles.stepText}>Đăng ký gói</Text>
            </View>

            <View style={styles.step}>
              <View style={styles.stepIcon}>
                <QrCode size={24} color={Colors.primary} />
              </View>
              <Text style={styles.stepText}>Nhận QR Code</Text>
            </View>

            <View style={styles.step}>
              <View style={styles.stepIcon}>
                <Coffee size={24} color={Colors.primary} />
              </View>
              <Text style={styles.stepText}>Thưởng thức</Text>
            </View>
          </View>
        </View>

        {/* Status */}
        <View style={styles.statusSection}>
          <View style={styles.statusCard}>
            <CheckCircle size={16} color={plan.active ? '#10B981' : '#6B7280'} />
            <Text style={[styles.statusText, { color: plan.active ? '#10B981' : '#6B7280' }]}>
              {plan.active ? 'Đang hoạt động' : 'Tạm ngưng'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.priceSummary}>
          <Text style={styles.priceSummaryLabel}>Tổng cộng:</Text>
          <Text style={styles.priceSummaryPrice}>{formatPrice(plan.price)}₫</Text>
        </View>
        
        <TouchableOpacity
          style={[styles.registerButton, orderLoading && styles.registerButtonDisabled]}
          onPress={handleRegister}
          disabled={orderLoading}
        >
          {orderLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={styles.registerButtonText}>
                {isAlreadySubscribed ? 'Đăng Ký Thêm' : 'Đăng Ký Ngay'}
              </Text>
              <Star size={16} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>

      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    height: HEADER_HEIGHT,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 16,
    zIndex: 10,
  },
  backButtonBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
  successBadge: {
    position: 'absolute',
    top: 60,
    right: 16,
    zIndex: 10,
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  successBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    marginTop: 0,
  },
  heroCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 32,
    borderRadius: 16,
    padding: 20,
    ...Shadows.medium,
    marginBottom: 16,
  },
  packageName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 16,
    lineHeight: 28,
  },
  priceSection: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  priceMainText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  priceUnit: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
  },
  metaDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#F3F4F6',
  },
  descriptionSection: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 16,
    ...Shadows.small,
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  productSection: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 16,
    ...Shadows.small,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 12,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  productImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  howItWorksSection: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 16,
    ...Shadows.small,
    marginBottom: 16,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  step: {
    alignItems: 'center',
    flex: 1,
  },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepText: {
    fontSize: 12,
    color: Colors.primary,

    textAlign: 'center',
    fontWeight: '500',
  },
  statusSection: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 16,
    marginBottom: 100,
    ...Shadows.small,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...Shadows.medium,
  },
  priceSummary: {
    flex: 1,
  },
  priceSummaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  priceSummaryPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  registerButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 140,
    justifyContent: 'center',
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PackageDetailScreen;
