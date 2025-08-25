import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { Colors } from '../constants/colors';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { QrCode, Phone, X, Check } from 'lucide-react-native';

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
  const [showQRModal, setShowQRModal] = useState(false);
  const [scannedPhone, setScannedPhone] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  React.useEffect(() => {
    if (showQRModal) {
      (async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
      })();
    }
  }, [showQRModal]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScannedPhone(data);
    setShowQRModal(false);
    Alert.alert('Quét thành công', `Số điện thoại: ${data}`);
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
    // Xử lý huỷ đơn ở đây
    Alert.alert('Đã huỷ đơn', `Lý do: ${cancelReason}`);
    setModalVisible(false);
    setCancelReason('');
  };

  const handleAcceptOrder = () => {
    // Xử lý nhận đơn ở đây
    Alert.alert('Đã nhận đơn');
    setModalVisible(false);
  };

  const handleCheckout = (type: 'qr' | 'phone') => {
    if (!selectedOrder) return;
    if (type === 'qr') {
      Alert.alert('Checkout bằng QR', `QR: ${selectedOrder.qr}`);
    } else {
      Alert.alert('Checkout bằng SĐT', `SĐT: ${selectedOrder.phone}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Quản lý đơn đặt trước</Text>
      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handleSelectOrder(item)}>
            <Text style={styles.name}>{item.customerName}</Text>
            <Text style={styles.phone}><Phone size={16} color={Colors.primary} /> {item.phone}</Text>
            <Text style={styles.reason}>Lý do: {item.reason}</Text>
            <Text style={styles.status}>Trạng thái: <Text style={{ color: Colors.warning }}>{item.status === 'pending' ? 'Chờ xử lý' : 'Đã xử lý'}</Text></Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
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
                    <Check size={18} color="#fff" /> <Text style={styles.actionText}>Nhận đơn</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelOrder}>
                    <X size={18} color="#fff" /> <Text style={styles.actionText}>Huỷ đơn</Text>
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
                    <QrCode size={20} color={Colors.primary} /> <Text style={styles.checkoutText}>Checkout bằng QR</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.checkoutBtn} onPress={() => handleCheckout('phone')}>
                    <Phone size={20} color={Colors.primary} /> <Text style={styles.checkoutText}>Checkout bằng SĐT</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
      {/* Nút quét QR luôn cố định ở cuối màn hình */}
      <View style={[styles.qrTabBar, {position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 10}]}> 
        <TouchableOpacity style={styles.qrTabBtn} onPress={() => setShowQRModal(true)}>
          <QrCode size={28} color={Colors.primary} />
          <Text style={styles.qrTabText}>Quét mã QR</Text>
        </TouchableOpacity>
      </View>
      {/* Modal camera quét QR dùng Expo BarCodeScanner */}
      <Modal visible={showQRModal} animationType="slide">
        <View style={styles.qrModalBg}>
          <Text style={styles.qrModalTitle}>Quét mã QR của khách hàng</Text>
          {hasPermission === null ? (
            <Text>Đang kiểm tra quyền camera...</Text>
          ) : hasPermission === false ? (
            <Text>Không có quyền truy cập camera</Text>
          ) : (
            <BarCodeScanner
              onBarCodeScanned={handleBarCodeScanned}
              style={styles.qrScanner}
            />
          )}
          <TouchableOpacity style={styles.qrCloseBtn} onPress={() => setShowQRModal(false)}>
            <Text style={{ color: Colors.primary, fontWeight: 'bold', fontSize: 16 }}>Đóng</Text>
          </TouchableOpacity>
          {scannedPhone && (
            <Text style={styles.qrResult}>Số điện thoại: {scannedPhone}</Text>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8EFE6',
    paddingTop: 48,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
    qrTabBar: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 12,
      backgroundColor: '#fff',
      borderTopWidth: 1,
      borderColor: '#eee',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    qrTabBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F5F5F5',
      borderRadius: 24,
      paddingHorizontal: 20,
      paddingVertical: 10,
      marginHorizontal: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.10,
      shadowRadius: 4,
      elevation: 2,
    },
    qrTabText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
      marginLeft: 8,
    },
    qrModalBg: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    qrModalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#fff',
      marginBottom: 16,
      textAlign: 'center',
    },
    qrScanner: {
      width: 280,
      height: 280,
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: '#222',
      marginBottom: 20,
      alignSelf: 'center',
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
    qrResult: {
      marginTop: 12,
      fontSize: 16,
      color: '#fff',
      textAlign: 'center',
      fontWeight: '500',
    },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  phone: {
    fontSize: 15,
    color: Colors.gray[700],
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  reason: {
    fontSize: 15,
    color: Colors.gray[600],
    marginBottom: 4,
  },
  status: {
    fontSize: 15,
    color: Colors.gray[500],
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 16,
    color: Colors.gray[700],
    marginBottom: 6,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
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
    marginTop: 16,
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
});

export default StaffOrderScreen;
