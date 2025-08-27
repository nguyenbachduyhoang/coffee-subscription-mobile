import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Coffee, CreditCard, ChevronDown } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { AuthContext } from '../../components/AuthProvider';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { subscriptionsApi } from '../../services/api';
import { getProfile as getProfileApi } from '../../services/authApi';

const formatDate = (d?: Date | string | number) => {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  const dd = `${date.getDate()}`.padStart(2, '0');
  const mm = `${date.getMonth() + 1}`.padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const QRCodeScreen: React.FC = () => {
  const auth = useContext(AuthContext);
  const [phone, setPhone] = useState('');
  const [subs, setSubs] = useState<any[]>([]);
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [endDate, setEndDate] = useState<string>('');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const windowWidth = Dimensions.get('window').width;
  const cardWidth = Math.min(windowWidth * 0.92, 380);

  useEffect(() => {
    const getProfilePhone = async () => {
      try {
        // Ưu tiên lấy token từ AsyncStorage trước
        let token = '';
        try {
          token = await AsyncStorage.getItem('token') || '';
        } catch {}
        
        const userData = await SecureStore.getItemAsync('user');
        let profile = userData ? JSON.parse(userData) : null;
        let foundPhone = profile?.phone || auth?.user?.phone || '';
        
        if (!foundPhone) {
          // Thử gọi API profile để lấy số điện thoại nếu chưa có
          if (!token && profile?.token) {
            token = profile.token;
          }
          
          if (token) {
            try {
              const p = await getProfileApi(token);
              const phoneFromApi = p?.phone || p?.data?.phone || p?.phoneNumber || '';
              if (phoneFromApi) {
                foundPhone = phoneFromApi;
                // cập nhật lại SecureStore để lần sau lấy nhanh hơn
                await SecureStore.setItemAsync('user', JSON.stringify({ ...(profile || {}), ...(auth?.user || {}), phone: phoneFromApi }));
              }
            } catch (error) {
              console.error('Error fetching profile for phone:', error);
            }
          }
        }
        setPhone(foundPhone || 'No phone');
      } catch (error) {
        console.error('Error in getProfilePhone:', error);
        setPhone('No phone');
      }
    };
    getProfilePhone();
  }, [auth?.user]);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        // Ưu tiên lấy token từ AsyncStorage trước, sau đó từ SecureStore
        let token = '';
        try {
          token = await AsyncStorage.getItem('token') || '';
        } catch {}
        
        if (!token) {
          const userData = await SecureStore.getItemAsync('user');
          const parsed = userData ? JSON.parse(userData) : null;
          token = parsed?.token || '';
        }
        
        if (!token) { 
          console.log('No token found for subscriptions');
          setSubs([]); 
          setSelectedSub(null); 
          return; 
        }
        
        console.log('Fetching subscriptions with token:', token ? 'Token exists' : 'No token');
        const data = await subscriptionsApi.getMySubscriptions(token);
        console.log('Subscriptions data:', data ? `Got ${Array.isArray(data) ? data.length : 0} items` : 'No data');
        
        const list = (Array.isArray(data) ? data : data?.data || []) as any[];
        // Chỉ gói đang hoạt động
        const active = list.filter((s: any) => `${s.status}`.toLowerCase() === 'active');
        setSubs(active);
        setSelectedSub(active?.[0] || null);
      } catch (e) {
        console.error('Error fetching subscriptions:', e);
        setSubs([]);
        setSelectedSub(null);
      }
    };
    fetchSubscriptions();
  }, [auth?.user]);

  useEffect(() => {
    const computeDaysLeft = async () => {
      if (!selectedSub) { setDaysLeft(null); setEndDate(''); return; }

      // Xác định mốc bắt đầu (ngày thanh toán/bắt đầu)
      const baseRaw = selectedSub.paidAt || selectedSub.paymentDate || selectedSub.startDate || selectedSub.createdAt || selectedSub.created_at;
      const baseDate = baseRaw ? new Date(baseRaw) : new Date();

      // Xác định ngày kết thúc: ưu tiên endDate từ API, nếu không thì +30 ngày theo yêu cầu
      let end = selectedSub.endDate ? new Date(selectedSub.endDate) : new Date(baseDate.getTime());
      if (!selectedSub.endDate) {
        end.setDate(end.getDate() + 30);
      }

      // Tính số ngày còn lại theo lịch: lấy đầu ngày của end - đầu ngày hôm nay
      const dayMs = 1000 * 60 * 60 * 24;
      const startOfToday = new Date(); startOfToday.setHours(0,0,0,0);
      const startOfEnd = new Date(end); startOfEnd.setHours(0,0,0,0);
      let d = Math.ceil((startOfEnd.getTime() - startOfToday.getTime()) / dayMs);

      setDaysLeft(d > 0 ? d : 0);
      setEndDate(formatDate(end));
    };
    computeDaysLeft();
  }, [selectedSub]);

  useEffect(() => {
    // Khi user thay đổi (đặc biệt là logout), reset các state liên quan
    const syncOnAuthChange = async () => {
      const hasUser = !!auth?.user;
      if (!hasUser) {
        setSubs([]);
        setSelectedSub(null);
        setDaysLeft(null);
        setEndDate('');
        setPhone('No phone');
        return;
      }
    };
    syncOnAuthChange();
  }, [auth?.user]);

  const renderDropdown = () => (
    <Modal visible={dropdownVisible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: '#fff', width: '86%', borderRadius: 16, padding: 12 }}>
          <Text style={{ fontWeight: '700', color: '#4E342E', fontSize: 16, marginBottom: 8 }}>Chọn gói đã thanh toán</Text>
          <FlatList
            data={subs}
            keyExtractor={(_, idx) => String(idx)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEE' }}
                onPress={() => { setSelectedSub(item); setDropdownVisible(false); }}
              >
                <Text style={{ color: '#4E342E', fontWeight: '600' }}>{item.planName || item.plan?.name || 'Gói'}</Text>
                <Text style={{ color: '#6B7280', fontSize: 12 }}>Thanh toán: {String(item.paidAt || item.paymentDate || item.startDate || item.createdAt || '').toString()}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={{ paddingVertical: 12, color: '#6B7280' }}>Không có gói đã thanh toán</Text>}
          />
          <TouchableOpacity style={{ alignSelf: 'flex-end', paddingVertical: 10 }} onPress={() => setDropdownVisible(false)}>
            <Text style={{ color: '#4E342E', fontWeight: '700' }}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const hasActive = !!selectedSub;
  const planLabel = hasActive ? (selectedSub?.planName || selectedSub?.plan?.name || 'Gói của bạn') : 'Chưa có gói hoạt động';

  return (
    <View style={styles.overlay}>
      <View style={styles.headerIconWrap}>
        <Coffee size={32} color="#B08968" style={{ marginRight: 10 }} />
        <Text style={styles.headerTitle}>Thẻ Thành Viên</Text>
      </View>

      <View style={styles.centerContent}>
        <LinearGradient
          colors={["#D6B59F", "#B17F60", "#8D5B3F"]}
          start={{ x: 0.0, y: 1.0 }}
          end={{ x: 0.0, y: 0.0 }}
          style={[styles.titleCard, { width: cardWidth }]}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => (subs?.length > 1 ? setDropdownVisible(true) : undefined)}
            style={styles.planChip}
          >
            <Text style={styles.planChipText} numberOfLines={1}>{planLabel}</Text>
            {subs?.length > 1 && <ChevronDown size={16} color="#fff" style={{ marginLeft: 6 }} />}
          </TouchableOpacity>

          {daysLeft !== null && (
            <View style={styles.daysBadgeWrap}>
              <Text style={styles.daysBadgeText}>Số ngày còn lại: {daysLeft} ngày</Text>
              {!!endDate && <Text style={styles.daysSubText}>Hết hạn: {endDate}</Text>}
            </View>
          )}
        </LinearGradient>

        <View style={[styles.qrShadowWrap, { width: cardWidth }]}> 
          <View style={styles.qrOuter}> 
            <View style={styles.qrInnerBox}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />

              {phone && phone !== '' && phone !== 'No phone' ? (
                <View style={styles.qrInnerWrap}>
                  <QRCode
                    value={(() => {
                      if (!phone || phone === 'No phone') return '' as any;
                      try {
                        const payload: any = { phone };
                        if (selectedSub?.subscriptionId) payload.subscriptionId = selectedSub.subscriptionId;
                        return JSON.stringify(payload);
                      } catch {
                        return phone;
                      }
                    })()}
                    size={150}
                    backgroundColor="#fff"
                    color="#000000"
                    quietZone={8}
                  />
                  <View style={styles.qrCenterIcon}>
                    <Text style={styles.xMark}>×</Text>
                  </View>
                </View>
              ) : (
                <Text style={{ color: '#B08968', fontWeight: '700', fontSize: 16 }}>
                 Vui lòng đăng nhập!
                </Text>
              )}
            </View>
          </View>

          <Text style={styles.qrLabel}>Mã QR</Text>
        </View>

        <View style={styles.actionRow}>
          <View style={styles.actionButtonWrap}>
            <TouchableOpacity style={[styles.actionButton, styles.actionButtonLeft]}>
              <Calendar color="#2AB27B" size={24} /> 
            </TouchableOpacity>
            <Text style={[styles.actionText, styles.actionTextLeft]}>Lịch sử sử dụng</Text>
          </View>

          <View style={styles.actionButtonWrap}>
            <TouchableOpacity style={[styles.actionButton, styles.actionButtonCenter]}>
              <Coffee color="#B08968" size={24} />
            </TouchableOpacity>
            <Text style={[styles.actionText, styles.actionTextCenter]}>Đặt trước đồ uống</Text>
          </View>

          <View style={styles.actionButtonWrap}>
            <TouchableOpacity style={[styles.actionButton, styles.actionButtonRight]}>
              <CreditCard color="#4E342E" size={24} />
            </TouchableOpacity>
            <Text style={[styles.actionText, styles.actionTextRight]}>Quản lý thanh toán</Text>
          </View>
        </View>
      </View>

      {renderDropdown()}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  headerIconWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    marginBottom: 18,
    width: '100%',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4E342E',
    textAlign: 'center',
  },
  centerContent: {
    alignItems: 'center',
    width: '100%',
    paddingTop: 0,
    flex: 1,
    justifyContent: 'center',
  },
  titleCard: {
    borderRadius: 28,
    paddingTop: 20,
    paddingBottom: 56,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#8D5B3F',
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
    zIndex: 1,
    minHeight: 150,
  },
  planChip: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '94%',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  planChipText: {
    color: '#fff',
    fontWeight: '700',
  },
  daysBadgeWrap: {
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)'
  },
  daysBadgeText: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
  daysSubText: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
  qrShadowWrap: {
    alignItems: 'center',
    marginTop: -46,
    marginBottom: 5,
    zIndex: 2,
  },
  qrOuter: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  qrInnerBox: {
    width: 200,
    height: 200,
    borderRadius: 22,
    backgroundColor: '#fff',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
    marginTop: 0,
  },
  qrInnerWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCenterIcon: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  xMark: {
    fontSize: 24,
    fontWeight: '300',
    color: '#2AB27B',
    lineHeight: 24,
  },
  qrLabel: {
    fontSize: 14,
    color: '#4E342E',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    backgroundColor: 'transparent',
    borderColor: '#4E342E',
  },
  cornerTL: {
    top: 6,
    left: 6,
    borderLeftWidth: 4,
    borderTopWidth: 4,
    borderTopLeftRadius: 10,
  },
  cornerTR: {
    top: 6,
    right: 6,
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderTopRightRadius: 10,
  },
  cornerBL: {
    bottom: 6,
    left: 6,
    borderLeftWidth: 4,
    borderBottomWidth: 4,
    borderBottomLeftRadius: 10,
  },
  cornerBR: {
    bottom: 6,
    right: 6,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    borderBottomRightRadius: 10,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
    marginBottom: 15,
    paddingHorizontal: 25,
  },
  actionButtonWrap: {
    alignItems: 'center',
    flex: 1,
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 60,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5D3B3',
    marginBottom: 8,
  },
  actionButtonLeft: {
    borderColor: '#2AB27B',
    borderWidth: 1,
  },
  actionButtonCenter: {
    borderColor: '#B08968',
    borderWidth: 1,
  },
  actionButtonRight: {
    borderColor: '#4E342E',
    borderWidth: 1,
  },
  actionText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
    maxWidth: 80,
  },
  actionTextLeft: {
    color: '#2AB27B',
  },
  actionTextCenter: {
    color: '#B08968',
    fontWeight: '600',
  },
  actionTextRight: {
    color: '#4E342E',
  },
});

export default QRCodeScreen;
