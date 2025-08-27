import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
  Linking,
  Platform,
  Animated,
  SafeAreaView,
} from "react-native"
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native"
import { createSubscriptionOrder, SubscriptionOrderResponse } from "../../services/paymentApi"
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../../hooks/useAuth';
import { Colors, Shadows } from "../../constants/colors"
import Successfully from "./components/Successfully"
import Ionicons from "react-native-vector-icons/Ionicons"
import { subscriptionsApi } from "../../services/api"
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

// Define route params type
type PaymentScreenRouteProp = RouteProp<{
  PaymentScreen: { planId: number };
}, 'PaymentScreen'>;

// Thêm hàm fetch subscription
async function checkSubscriptionActive(planId: number, token: string) {
  try {
    return await subscriptionsApi.checkSubscriptionActive(planId, token);
  } catch (err) {
    return false;
  }
}

export default function PaymentScreen() {
  const route = useRoute<PaymentScreenRouteProp>()
  const navigation = useNavigation()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [paymentData, setPaymentData] = useState<SubscriptionOrderResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [remainingSec, setRemainingSec] = useState<number | null>(15 * 60) // default 15 minutes
  const [qrAnim] = useState(new Animated.Value(0.9))
  const [copied, setCopied] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const getToken = async () => {
    if (user?.token) return user.token;

    try {
      const tokenFromAS = await AsyncStorage.getItem('token');
      if (tokenFromAS) return tokenFromAS;
    } catch {}

    const userData = await SecureStore.getItemAsync('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        return parsed.token || null;
      } catch {}
    }
    return null;
  };

  const createOrder = async () => {
    const token = await getToken();
    if (!token) {
      Alert.alert("Lỗi", "Không tìm thấy token đăng nhập. Vui lòng đăng nhập lại.")
      navigation.goBack()
      return
    }
    try {
      setError(null)
      const data = await createSubscriptionOrder(Number(route.params.planId), token)
      setPaymentData(data)
    } catch (e: any) {
      setError(e?.message || "Không thể tạo đơn hàng")
      Alert.alert("Lỗi", e?.message || "Không thể tạo đơn hàng")
    }
  }

  useEffect(() => {
    if (!user) {
      Alert.alert("Thông báo", "Bạn cần đăng nhập để tiếp tục", [{ text: "OK", onPress: () => navigation.goBack() }])
      return
    }

    if (!route.params?.planId || isNaN(Number(route.params.planId))) { // Sửa: kiểm tra kiểu số
      Alert.alert("Lỗi", "Không tìm thấy thông tin gói dịch vụ", [{ text: "OK", onPress: () => navigation.goBack() }])
      return
    }

    const initializePayment = async () => {
      setLoading(true)
      await createOrder()
      setLoading(false)
    }

    initializePayment()
  }, [user, route.params.planId])

  useEffect(() => {
    if (paymentData) {
      Animated.spring(qrAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
      }).start()
    }
  }, [paymentData])

  // countdown timer (FE-only)
  useEffect(() => {
    if (remainingSec === null) return
    const t = setInterval(() => {
      setRemainingSec((s) => {
        if (s === null) return null
        if (s <= 1) {
          clearInterval(t)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [remainingSec])

  // Polling kiểm tra thanh toán: chỉ thành công khi số subscription Active của plan tăng
  useEffect(() => {
    if (!paymentData) return;
    let interval: NodeJS.Timeout | undefined;

    const getActiveCount = async (token: string, planId: number) => {
      try {
        const res = await subscriptionsApi.getMySubscriptions(token);
        return res.filter((sub: any) => sub.planId === planId && sub.status === 'Active').length;
      } catch {
        return 0;
      }
    };

    (async () => {
      // Lấy token
      let token = user?.token;
      if (!token) {
        const userData = await SecureStore.getItemAsync('user');
        if (userData) {
          const parsed = JSON.parse(userData);
          token = parsed.token;
        }
      }
      if (!token) {
        Alert.alert("Lỗi", "Không tìm thấy token đăng nhập. Vui lòng đăng nhập lại.");
        navigation.goBack();
        return;
      }

      const planId = route.params.planId;
      const baselineCount = await getActiveCount(token, planId);

      interval = setInterval(async () => {
        const currentCount = await getActiveCount(token!, planId);
        if (currentCount > baselineCount) {
          if (interval) clearInterval(interval);
          // Gửi local notification ngay khi xác nhận thanh toán thành công
          try {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: 'Thanh toán thành công',
                body: 'Subscription của bạn đã được kích hoạt.',
              },
              trigger: null,
            });
          } catch {}
          setShowSuccessModal(true);
        }
      }, 5000);
    })();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [paymentData, route.params.planId, user]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Đang tạo đơn hàng...</Text>
      </View>
    )
  }

  if (error && !paymentData) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>❌ {error}</Text>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtnText}>Đóng</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (!paymentData) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Không có dữ liệu thanh toán.</Text>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtnText}>Đóng</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Nút Back */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backIconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color={Colors.primary} />
          </TouchableOpacity>
          <View style={styles.headerTitleBox}>
            <Text style={styles.title}>Quét mã QR để thanh toán</Text>
          </View>
        </View>
        {/* QR with animation */}
        <Animated.View style={[styles.qrContainer, { transform: [{ scale: qrAnim }] }]}>
          <Image
            source={{ uri: paymentData.qrUrl }}
            style={styles.qr}
            resizeMode="contain"
            accessibilityLabel="QR code thanh toán"
          />
        </Animated.View>
        {/* Bank Info Rows */}
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Ngân hàng</Text>
            <View style={styles.rowRight}>
              <Text style={styles.valueBold}>{paymentData.bankName}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Số tài khoản</Text>
            <View style={styles.rowRight}>
              <Text style={styles.valueBold}>{paymentData.bankAccount}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Chủ tài khoản</Text>
            <View style={styles.rowRight}>
              <Text style={styles.valueBold}>{paymentData.accountHolder}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Nội dung chuyển khoản</Text>
            <View style={styles.rowRight}>
              <Text style={[styles.valueBold, styles.transferContent]}>{paymentData.transferContent}</Text>
            </View>
          </View>
        </View>
        {/* Amount strip */}
        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>Số tiền</Text>
          <Text style={styles.amountValue}>
            {typeof paymentData.amount === "number" ? paymentData.amount.toLocaleString("vi-VN") : "0"} đ
          </Text>
        </View>
        {/* Note box */}
        <View style={styles.noteBox}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.noteTitle}>Lưu ý:</Text>
          </View>
          <Text style={styles.noteText}>
            Vui lòng chuyển khoản đúng số tiền và nội dung để đơn hàng được xử lý tự động. Subscription của bạn sẽ được kích hoạt sau khi thanh toán thành công.
          </Text>
        </View>
        {/* Confirm/Close */}
        <TouchableOpacity style={styles.closeBtnMain} onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtnTextMain}>Đóng</Text>
        </TouchableOpacity>
        {/* Copy feedback */}
        {copied && (
          <View style={styles.copiedToast}>
            <Text style={{ color: "#fff", fontWeight: "bold" }}>Đã sao chép {copied}!</Text>
          </View>
        )}
        <Successfully
          visible={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          onGoHome={() => {
            setShowSuccessModal(false);
            (navigation as any).navigate('MainTabs', { screen: 'Home' });
          }}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F6F3",
  },
  contentContainer: {
    alignItems: "center",
    paddingTop: 40, // Tăng lên để tránh vùng camera/notch
    paddingHorizontal: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  qrHeader: {
    alignItems: "center",
    marginBottom: 12,
  },
  qrIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 2,
    textAlign: "center",
    fontFamily: "Poppins-SemiBold",
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray[600],
    marginBottom: 8,
    textAlign: "center",
    fontFamily: "Poppins-Regular",
  },
  qrContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    ...Shadows.medium,
    elevation: 12,
    shadowOpacity: 0.12,
    alignItems: "center",
  },
  qr: {
    width: 200,
    height: 200,
  },
  scanLabel: {
    marginTop: 8,
    fontSize: 13,
    color: Colors.gray[600],
    fontFamily: "Poppins-Regular",
  },
  infoBox: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 10,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E0D7CE",
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: 15,
    color: Colors.gray[700],
    fontFamily: "Poppins-Regular",
  },
  copyText: {
    fontSize: 18,
    marginLeft: 8,
    color: Colors.primary,
  },
  valueBold: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#4E342E",
    textAlign: "right",
    fontFamily: "Poppins-SemiBold",
  },
  transferContent: {
    color: "#B71C1C",
    fontWeight: "bold",
    maxWidth: 180,
  },
  amountBox: {
    backgroundColor: "#4E342E",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  amountLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Poppins-SemiBold",
  },
  amountValue: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "right",
    fontFamily: "Poppins-SemiBold",
  },
  noteBox: {
    backgroundColor: "#FFF8E1",
    borderRadius: 8,
    padding: 16,
    marginTop: 10,
    marginBottom: 20,
    width: "100%",
    borderWidth: 1,
    borderColor: "#FFECB3",
  },
  noteIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  noteTitle: {
    fontWeight: "bold",
    color: "#4E342E",
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
  },
  noteText: {
    fontSize: 13,
    color: Colors.gray[700],
    fontFamily: "Poppins-Regular",
    lineHeight: 18,
  },
  closeBtnMain: {
    backgroundColor: "#4E342E",
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 4,
    width: "100%",
  },
  closeBtnTextMain: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.gray[600],
    fontFamily: "Poppins-Regular",
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Poppins-SemiBold",
  },
  closeBtn: {
    backgroundColor: "#ddd",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  closeBtnText: {
    fontWeight: "600",
    color: "#333",
    fontFamily: "Poppins-SemiBold",
  },
  copiedToast: {
    position: "absolute",
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: "center",
    backgroundColor: "#4E342E",
    padding: 10,
    borderRadius: 12,
    elevation: 8,
  },
  backBtn: {
    alignSelf: "flex-start",
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  backBtnText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 12,
    paddingHorizontal: 4,
    position: "relative",
  },
  backIconBtn: {
    padding: 8,
    marginRight: 0,
    zIndex: 2,
  },
  backIcon: {
    fontSize: 22,
    color: Colors.primary,
    fontWeight: "bold",
  },
  headerTitleBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
  },
})
