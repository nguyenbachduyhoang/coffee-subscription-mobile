import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft, 
  CreditCard, 
  Truck, 
  QrCode,
  Check
} from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming 
} from 'react-native-reanimated';
import { Colors, Shadows } from '../../constants/colors';
import { PACKAGES } from '../../constants/data';
import { useStorage } from '../../hooks/useStorage';
import { useAuth } from '../../hooks/useAuth';
import { Purchase } from '../../types';

export default function PaymentScreen() {
  const { packageId } = useLocalSearchParams();
  const { user } = useAuth();
  const { savePurchase } = useStorage();
  
  const [selectedMethod, setSelectedMethod] = useState<'momo' | 'cod'>('momo');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedPackage = PACKAGES.find(pkg => pkg.id === packageId);
  const successScale = useSharedValue(0);
  const successOpacity = useSharedValue(0);

  useEffect(() => {
    if (showSuccess) {
      successOpacity.value = withTiming(1);
      successScale.value = withSpring(1);
    }
  }, [showSuccess]);

  const successAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
    opacity: successOpacity.value,
  }));

  if (!selectedPackage) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Gói không tồn tại</Text>
      </View>
    );
  }

  const handlePayment = async () => {
    if (selectedMethod === 'cod' && (!address || !phone)) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const purchase: Purchase = {
        id: Date.now().toString(),
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        price: selectedPackage.price,
        paymentMethod: selectedMethod,
        status: 'completed',
        date: new Date().toISOString(),
        address: selectedMethod === 'cod' ? address : undefined,
      };

      await savePurchase(purchase);
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        router.back();
      }, 3000);
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra trong quá trình thanh toán');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh Toán</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Package Summary */}
        <View style={styles.packageSummary}>
          <Image source={{ uri: selectedPackage.image }} style={styles.packageImage} />
          <View style={styles.packageInfo}>
            <Text style={styles.packageName}>{selectedPackage.name}</Text>
            <Text style={styles.packagePrice}>
              {selectedPackage.price.toLocaleString('vi-VN')}₫
            </Text>
            <Text style={styles.packageDescription}>
              {selectedPackage.cupsPerDay} ly cà phê mỗi ngày trong {selectedPackage.duration}
            </Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương Thức Thanh Toán</Text>
          
          <TouchableOpacity
            style={[
              styles.methodCard,
              selectedMethod === 'momo' && styles.methodCardActive
            ]}
            onPress={() => setSelectedMethod('momo')}
          >
            <CreditCard size={24} color={selectedMethod === 'momo' ? Colors.white : Colors.primary} />
            <View style={styles.methodInfo}>
              <Text style={[
                styles.methodTitle,
                selectedMethod === 'momo' && styles.methodTitleActive
              ]}>
                MoMo
              </Text>
              <Text style={[
                styles.methodDescription,
                selectedMethod === 'momo' && styles.methodDescriptionActive
              ]}>
                Thanh toán qua ví điện tử MoMo
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.methodCard,
              selectedMethod === 'cod' && styles.methodCardActive
            ]}
            onPress={() => setSelectedMethod('cod')}
          >
            <Truck size={24} color={selectedMethod === 'cod' ? Colors.white : Colors.primary} />
            <View style={styles.methodInfo}>
              <Text style={[
                styles.methodTitle,
                selectedMethod === 'cod' && styles.methodTitleActive
              ]}>
                Thanh toán khi nhận hàng
              </Text>
              <Text style={[
                styles.methodDescription,
                selectedMethod === 'cod' && styles.methodDescriptionActive
              ]}>
                Thanh toán tiền mặt khi nhận hàng
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Payment Details */}
        {selectedMethod === 'momo' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quét Mã QR</Text>
            <View style={styles.qrContainer}>
              <QrCode size={120} color={Colors.primary} />
              <Text style={styles.qrText}>
                Quét mã QR bằng ứng dụng MoMo để thanh toán
              </Text>
              <Text style={styles.qrAmount}>
                Số tiền: {selectedPackage.price.toLocaleString('vi-VN')}₫
              </Text>
            </View>
          </View>
        )}

        {selectedMethod === 'cod' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông Tin Giao Hàng</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Địa chỉ giao hàng"
              value={address}
              onChangeText={setAddress}
              placeholderTextColor={Colors.gray[400]}
              multiline
            />
            
            <TextInput
              style={styles.input}
              placeholder="Số điện thoại"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholderTextColor={Colors.gray[400]}
            />
          </View>
        )}

        {/* Payment Button */}
        <View style={styles.paymentSection}>
          <TouchableOpacity
            style={[styles.paymentButton, isProcessing && styles.paymentButtonDisabled]}
            onPress={handlePayment}
            disabled={isProcessing}
          >
            <Text style={styles.paymentButtonText}>
              {isProcessing ? 'Đang xử lý...' : 
               selectedMethod === 'momo' ? 'Đã Thanh Toán' : 'Xác Nhận Đặt Hàng'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="none">
        <View style={styles.successBackground}>
          <Animated.View style={[styles.successModal, successAnimatedStyle]}>
            <View style={styles.successIcon}>
              <Check size={32} color={Colors.white} />
            </View>
            
            <Text style={styles.successTitle}>Cảm Ơn Bạn!</Text>
            <Text style={styles.successMessage}>
              Đơn hàng của bạn đã được xác nhận thành công.
              {selectedMethod === 'cod' 
                ? ' Chúng tôi sẽ giao hàng trong 24h tới.'
                : ' Chúng tôi sẽ xử lý đơn hàng ngay lập tức.'
              }
            </Text>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.primary,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: Colors.error,
    textAlign: 'center',
    margin: 20,
  },
  packageSummary: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    ...Shadows.medium,
  },
  packageImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  packageInfo: {
    flex: 1,
    marginLeft: 16,
  },
  packageName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.primary,
    marginBottom: 4,
  },
  packagePrice: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  packageDescription: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: Colors.gray[600],
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.primary,
    marginBottom: 16,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.gray[200],
    ...Shadows.small,
  },
  methodCardActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  methodInfo: {
    flex: 1,
    marginLeft: 16,
  },
  methodTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.primary,
    marginBottom: 4,
  },
  methodTitleActive: {
    color: Colors.white,
  },
  methodDescription: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: Colors.gray[600],
  },
  methodDescriptionActive: {
    color: Colors.secondary,
  },
  qrContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    ...Shadows.medium,
  },
  qrText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: Colors.gray[600],
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  qrAmount: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: Colors.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    backgroundColor: Colors.white,
    marginBottom: 16,
  },
  paymentSection: {
    padding: 20,
    paddingBottom: 40,
  },
  paymentButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  paymentButtonDisabled: {
    backgroundColor: Colors.gray[400],
  },
  paymentButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  successBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  successModal: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    margin: 20,
    maxWidth: 300,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: Colors.primary,
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: Colors.gray[600],
    textAlign: 'center',
    lineHeight: 20,
  },
});