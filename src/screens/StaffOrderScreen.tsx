import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert, StatusBar, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { QrCode, Phone, X, Check, LogOut, User, Coffee, Info } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { staffAuth, staffRedeem, ScannedSubscription } from '../services/staffApi';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../hooks/useAuth';

// Dummy data
const orders = [
  {
    id: '1',
    customerName: 'Nguyễn Văn A',
    phone: '0901234567',
    reason: 'Khách đặt trước để nhận tại quán',
    status: 'pending',
    qr: 'QR1',
  },
  {
    id: '2',
    customerName: 'Trần Thị B',
    phone: '0909876543',
    reason: 'Khách đặt trước qua app',
    status: 'pending',
    qr: 'QR2',
  },
];

const StaffOrderScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { setUser } = useAuth();
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [activeSub, setActiveSub] = useState<ScannedSubscription | null>(null);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  // subscriptions list for a customer
  const [subsList, setSubsList] = useState<ScannedSubscription[]>([]);
  const [subsModalVisible, setSubsModalVisible] = useState(false);

  // Pretty notice modal
  const [noticeVisible, setNoticeVisible] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [noticeType, setNoticeType] = useState<'success' | 'error' | 'info'>('info');
  const openNotice = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNoticeTitle(title);
    setNoticeMessage(message);
    setNoticeType(type);
    setNoticeVisible(true);
  };
  const closeNotice = () => setNoticeVisible(false);

  const handleLogout = async () => {
    Alert.alert(
      'Đăng Xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng Xuất', onPress: async () => {
            await AsyncStorage.removeItem('staffToken');
            // Sử dụng AuthContext để logout
            setUser(null);
            Alert.alert('Thành công', 'Đã đăng xuất khỏi hệ thống.');
          }, style: 'destructive' },
      ]
    );
  };

  const friendlyError = (msg?: string) => {
    const raw = (msg || '').toLowerCase();
    if (raw.includes('daily quota exceeded') || raw.includes('quota') || raw.includes('already redeemed')) {
      return 'Khách hàng này đã hết lượt trong ngày hoặc đã nhận đồ uống rồi.';
    }
    if (raw.includes('not found') || raw.includes('no active')) {
      return 'Không tìm thấy subscription hoạt động cho khách hàng này.';
    }
    return msg || 'Có lỗi xảy ra, vui lòng thử lại.';
  };

  const fetchSubsByPhone = async (phone: string, preselectId?: number) => {
    setLookupLoading(true);
    try {
      const subs: ScannedSubscription[] = await staffRedeem.scanQr(phone);
      let activeOnly = subs.filter(s => (s.status || '').toLowerCase() === 'active');
      // Nếu có preselectId từ QR -> chỉ giữ đúng gói đó
      if (preselectId) {
        activeOnly = activeOnly.filter(s => Number(s.subscriptionId) === Number(preselectId));
      }
      setSubsList(activeOnly);
      if (activeOnly.length === 1) {
        setActiveSub(activeOnly[0]);
      } else {
        setActiveSub(null);
      }
      setSubsModalVisible(true);
    } catch (e: any) {
      setSubsList([]);
      openNotice('Không thể tải subscriptions', friendlyError(e?.message), 'error');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleLookupByPhone = async () => {
    const phone = phoneInput.trim();
    if (!phone) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return;
    }
    await fetchSubsByPhone(phone);
  };

  const handleRedeemByPhone = async () => {
    if (!activeSub) return;
    setRedeemLoading(true);
    try {
      const res = await staffRedeem.redeem(activeSub.subscriptionId, 1);
      if (res?.success) {
        try { await AsyncStorage.setItem('lastRedeemDate', new Date().toDateString()); } catch {}
        openNotice('Thành công', `Đã checkout: ${res.productName} (${res.quantity})`, 'success');
        setActiveSub(null);
        setPhoneInput('');
        setSubsModalVisible(false);
      } else {
        const msg = friendlyError(res?.message);
        openNotice('Không thể checkout', msg, 'error');
      }
    } catch (e: any) {
      const msg = friendlyError(e?.response?.data?.message || e?.message);
      openNotice('Không thể checkout', msg, 'error');
    } finally {
      setRedeemLoading(false);
    }
  };

  React.useEffect(() => {
    if (showCamera) {
      requestPermission();
      setScanned(false);
    }
  }, [showCamera]);

  const handleQRCheckout = async (phone: string, preselectId?: number) => {
    try {
      await fetchSubsByPhone(phone, preselectId);
    } catch (e: any) {
      openNotice('Không thể xử lý QR', friendlyError(e?.message), 'error');
    }
  };

  const handleCameraScanned = async ({ data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);
    let phone = '';
    let preselectId: number | undefined = undefined;
    try {
      const parsed = JSON.parse(data || '{}');
      phone = String(parsed.phone || '').trim();
      if (parsed.subscriptionId) preselectId = Number(parsed.subscriptionId);
    } catch {
      phone = (data || '').trim();
    }
    if (!phone) {
      Alert.alert('Không hợp lệ', 'Dữ liệu QR trống.');
      setScanned(false);
      return;
    }
    setPhoneInput(phone);
    setShowCamera(false);
    await handleQRCheckout(phone, preselectId);
  };

  const [selectedOrder, setSelectedOrder] = useState<null | typeof orders[0]>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const handleSelectOrder = (order: any) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const handleCancelOrder = () => {
    if (!cancelReason) {
      Alert.alert('Lý do huỷ không được để trống');
      return;
    }
    Alert.alert('Đã huỷ đơn', `Lý do: ${cancelReason}`);
    setModalVisible(false);
    setCancelReason('');
  };

  const handleAcceptOrder = () => {
    Alert.alert('Đã nhận đơn');
    setModalVisible(false);
  };

  const handleCheckout = async (type: 'qr' | 'phone') => {
    if (!activeSub) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn gói Active để checkout.');
      return;
    }
    try {
      const res = await staffRedeem.redeem(activeSub.subscriptionId, 1);
      if (res?.success) {
        openNotice('Thành công', `Đã checkout: ${res.productName} (${res.quantity})`, 'success');
        setModalVisible(false);
        setActiveSub(null);
        setPhoneInput('');
        setSubsModalVisible(false);
      } else {
        const msg = friendlyError(res?.message);
        openNotice('Không thể checkout', msg, 'error');
      }
    } catch (e: any) {
      const msg = friendlyError(e?.response?.data?.message || e?.message);
      openNotice('Không thể checkout', msg, 'error');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left','right','bottom']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Professional Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={[Colors.primary, '#3A1F1C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.headerGradient,
            { paddingTop: insets.top + 12, paddingBottom: 12 + Math.max(0, insets.top) / 2 }
          ]}
        >
          <View style={styles.headerContent}>
            <View style={styles.sideBox}>
              <View style={styles.logoContainer}>
                <Coffee size={20} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Staff Dashboard</Text>
              <Text style={styles.headerSubtitle}>Quản lý đơn hàng & Checkout</Text>
            </View>

            <TouchableOpacity style={[styles.sideBox, styles.logoutButton]} onPress={handleLogout}>
              <LogOut size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.content}>
        {/* Phone-only checkout - polished card */}
        <View style={styles.phoneCard}>
          <LinearGradient colors={[Colors.secondary, '#F8EFE6']} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={styles.cardHeaderGrad}>
            <View style={styles.cardHeaderContent}>
              <Phone size={20} color={Colors.primary} />
              <Text style={styles.cardHeaderText}>Checkout bằng SĐT</Text>
            </View>
          </LinearGradient>
          <View style={styles.inputRow}>
            <Phone size={18} color={Colors.gray[400]} />
            <TextInput
              style={styles.inputField}
              placeholder="Nhập số điện thoại khách hàng"
              value={phoneInput}
              onChangeText={setPhoneInput}
              keyboardType="phone-pad"
              placeholderTextColor={Colors.gray[400]}
            />
          </View>
          <TouchableOpacity activeOpacity={0.9} onPress={handleLookupByPhone} disabled={lookupLoading}>
            <LinearGradient
              colors={[Colors.primary, '#3A1F1C']}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={[styles.primaryCtaBtn, lookupLoading && { opacity: 0.8 }]}
            >
              <Phone size={20} color={'#fff'} />
              <Text style={styles.primaryCtaText}>{lookupLoading ? 'Đang kiểm tra...' : 'Tìm subscriptions'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* QR checkout - polished CTA */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => setShowCamera(true)}>
          <LinearGradient colors={[Colors.white, Colors.secondary]} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={styles.qrCtaBtn}>
            <QrCode size={20} color={Colors.primary} />
            <Text style={[styles.checkoutText, { fontSize: 16 }]}>Mở camera quét QR</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Orders Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Đơn hàng đang chờ</Text>
          <Text style={styles.sectionSubtitle}>{orders.length} đơn hàng</Text>
        </View>

        <FlatList
          data={orders}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => handleSelectOrder(item)}>
              <View style={styles.cardHeader}>
                <View style={styles.customerInfo}>
                  <View style={styles.avatar}>
                    <User size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.customerDetails}>
                    <Text style={styles.name}>{item.customerName}</Text>
                    <Text style={styles.phone}><Phone size={16} color={Colors.primary} /> {item.phone}</Text>
                  </View>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{item.status === 'pending' ? 'Chờ xử lý' : 'Đã xử lý'}</Text>
                </View>
              </View>
              <Text style={styles.reason}>Lý do: {item.reason}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </View>

      {/* Camera Modal */}
      <Modal visible={showCamera} animationType="slide" onRequestClose={() => {}}>
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          {!permission || !permission.granted ? (
            <View style={styles.cameraCenter}>
              <Text style={styles.cameraInfo}>Yêu cầu quyền truy cập camera...</Text>
              <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
                <Text style={styles.permissionBtnText}>Cấp quyền</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <CameraView
                style={{ flex: 1 }}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={scanned ? undefined : (handleCameraScanned as any)}
              />
              <View style={styles.cameraOverlay} pointerEvents="none">
                <View style={styles.scanFrame} />
                <Text style={styles.hint}>Đưa mã QR vào khung</Text>
              </View>
            </>
          )}
          <TouchableOpacity style={styles.qrCloseBtn} onPress={() => setShowCamera(false)}>
            <Text style={{ color: Colors.primary, fontWeight: 'bold' }}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Modal chọn subscriptions theo flow */}
      <Modal visible={subsModalVisible} transparent animationType="slide" onRequestClose={() => setSubsModalVisible(false)}>
        <Pressable style={styles.modalBg} onPress={() => setSubsModalVisible(false)}>
          <View style={styles.modalCard}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSubsModalVisible(false)}>
              <X size={22} color={Colors.gray[500]} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Subscriptions của khách</Text>
            <FlatList
              data={subsList}
              keyExtractor={(item) => String(item.subscriptionId)}
              renderItem={({ item }) => {
                const status = (item.status || '').toLowerCase();
                const isActive = status === 'active';
                const badgeColor = Colors.success;
                const statusLabel = 'Active';
                return (
                  <TouchableOpacity
                    disabled={!isActive}
                    onPress={() => setActiveSub(item)}
                    style={{
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: Colors.gray[200],
                      opacity: 1,
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flex: 1, paddingRight: 12 }}>
                        <Text style={{ color: Colors.primary, fontWeight: '700' }}>{item.planName}</Text>
                        <Text style={{ color: Colors.gray[700], marginTop: 2, fontSize: 13 }}>Sản phẩm: {item.productName}</Text>
                        <Text style={{ color: Colors.gray[600], marginTop: 2, fontSize: 12 }}>ID: {item.subscriptionId}</Text>
                      </View>
                      <View style={{ backgroundColor: badgeColor, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>{statusLabel}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={<Text style={{ textAlign: 'center', color: Colors.gray[600], paddingVertical: 16 }}>Không có subscription Active</Text>}
            />

            {/* Nếu đã chọn 1 gói Active, hiển thị confirm */}
            {activeSub && (
              <TouchableOpacity activeOpacity={0.9} onPress={handleRedeemByPhone} disabled={redeemLoading}>
                <LinearGradient colors={[Colors.success, '#0E8F6B']} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={[styles.acceptBtn, { justifyContent: 'center', marginTop: 12 }]}>
                  <Check size={18} color="#fff" />
                  <Text style={styles.actionText}>{redeemLoading ? 'Đang checkout...' : `Xác nhận phát - ${activeSub.planName}`}</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </Modal>

      {/* Action modal (giữ nguyên) */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <Pressable style={styles.modalBg} onPress={() => setModalVisible(false)}>
          <View style={styles.modalCard}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
              <X size={22} color={Colors.gray[500]} />
            </TouchableOpacity>
            {selectedOrder && (
              <>
                <Text style={styles.modalTitle}>Đơn của {selectedOrder?.customerName}</Text>
                <Text style={styles.modalLabel}>SĐT: {selectedOrder?.phone}</Text>
                <Text style={styles.modalLabel}>Lý do: {selectedOrder?.reason}</Text>
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.acceptBtn} onPress={handleAcceptOrder}>
                    <Check size={18} color="#fff" /><Text style={styles.actionText}>Nhận đơn</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelOrder}>
                    <X size={18} color="#fff" /><Text style={styles.actionText}>Huỷ đơn</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Lý do huỷ đơn (bắt buộc khi huỷ)"
                  value={cancelReason}
                  onChangeText={setCancelReason}
                />
                <View style={styles.checkoutRow}>
                  <TouchableOpacity style={styles.checkoutBtn} onPress={() => handleCheckout('qr')}>
                    <QrCode size={20} color={Colors.primary} /><Text style={styles.checkoutText}>Checkout bằng QR</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.checkoutBtn} onPress={() => handleCheckout('phone')}>
                    <Phone size={20} color={Colors.primary} /><Text style={styles.checkoutText}>Checkout bằng SĐT</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </Pressable>
      </Modal>

      {/* Pretty Notice Modal */}
      <Modal visible={noticeVisible} transparent animationType="fade" onRequestClose={() => {}}>
        <Pressable style={styles.noticeBackdrop} onPress={closeNotice}>
          <View style={styles.noticeCard}>
            <LinearGradient
              colors={noticeType === 'success' ? ['#10B981','#059669'] : noticeType === 'error' ? ['#EF4444','#B91C1C'] : [Colors.primary,'#3A1F1C']}
              start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }}
              style={styles.noticeHeader}
            >
              {noticeType === 'success' ? <Check size={18} color="#fff" /> : noticeType === 'error' ? <X size={18} color="#fff" /> : <Info size={18} color="#fff" />}
              <Text style={styles.noticeTitle}>{noticeTitle}</Text>
            </LinearGradient>
            <Text style={styles.noticeMessage}>{noticeMessage}</Text>
            <TouchableOpacity style={styles.noticeBtn} onPress={closeNotice}>
              <Text style={styles.noticeBtnText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8EFE6',
  },
  header: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    // bỏ margin ngang để full-bleed tới mép màn hình (màu nâu chạm tận status bar)
  },
  headerGradient: {
    // paddingTop sẽ cộng thêm insets.top ở runtime để tránh camera/notch
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // giảm khoảng cách tổng thể giữa 2 dòng
    paddingVertical: 2,
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
    lineHeight: 24,
  },
  headerSubtitle: {
    fontSize: 12.5,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 16,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.primary,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray[600],
    backgroundColor: Colors.gray[100],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 1,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  customerDetails: {
    flex: 1,
  },
  statusBadge: {
    backgroundColor: Colors.warning,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 2,
  },
  phone: {
    fontSize: 13,
    color: Colors.gray[700],
    flexDirection: 'row',
    alignItems: 'center',
  },
  reason: {
    fontSize: 13,
    color: Colors.gray[600],
    lineHeight: 20,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    width: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 14,
    color: Colors.gray[700],
    marginBottom: 6,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  acceptBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  cancelBtn: {
    backgroundColor: Colors.error,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginBottom: 10,
    backgroundColor: Colors.gray[50],
  },
  checkoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  checkoutBtn: {
    backgroundColor: Colors.gray[100],
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  checkoutText: {
    color: Colors.primary,
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 15,
  },
  phoneCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 1,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  cardHeaderGrad: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  cardHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
    marginLeft: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    marginBottom: 14,
  },
  inputField: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: Colors.gray[700],
  },
  primaryCtaBtn: {
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryCtaText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 15,
  },
  subCard: {
    marginTop: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  subTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 6,
  },
  subLine: {
    fontSize: 14,
    color: Colors.gray[700],
    marginBottom: 4,
  },
  subValue: {
    fontWeight: '600',
    color: Colors.primary,
  },
  qrCtaBtn: {
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  cameraCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraInfo: {
    color: '#fff',
    marginBottom: 12,
  },
  permissionBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  permissionBtnText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  cameraOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 240,
    height: 240,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#fff',
    opacity: 0.9,
  },
  hint: {
    color: '#fff',
    marginTop: 14,
    fontWeight: '600',
  },
  qrCloseBtn: {
    position: 'absolute',
    top: 32,
    right: 32,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  noticeBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  noticeCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  noticeTitle: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  noticeMessage: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    color: Colors.gray[700],
    fontSize: 15,
    lineHeight: 20,
  },
  noticeBtn: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 12,
  },
  noticeBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default StaffOrderScreen;
