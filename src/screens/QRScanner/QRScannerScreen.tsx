import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { staffRedeem, ScannedSubscription } from '../../services/staffApi';

export default function QRScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    requestPermission();
  }, []);

  const resetScan = useCallback(() => setScanned(false), []);

  if (!permission || !permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.infoText}>Yêu cầu quyền truy cập camera...</Text>
        <TouchableOpacity style={styles.requestBtn} onPress={requestPermission}>
          <Text style={styles.requestBtnText}>Cấp quyền</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);
    const phone = (data || '').trim();
    if (!phone) {
      Alert.alert('Không hợp lệ', 'Dữ liệu QR trống.');
      setScanned(false);
      return;
    }
    try {
      const subs: ScannedSubscription[] = await staffRedeem.scanQr(phone);
      const active = subs.find(s => s.status === 'Active');
      if (!active) {
        Alert.alert('Không hợp lệ', 'Không tìm thấy subscription Active cho SĐT này.', [
          { text: 'Quét lại', onPress: resetScan }
        ]);
        return;
      }
      const res = await staffRedeem.redeem(active.subscriptionId, 1);
      if (res?.success) {
        Alert.alert('Thành công', `Đã checkout: ${res.productName} (${res.quantity})`, [
          { text: 'Đóng', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Thất bại', res?.message || 'Không thể checkout', [
          { text: 'Quét lại', onPress: resetScan }
        ]);
      }
    } catch (e: any) {
      Alert.alert('Lỗi', e?.message || 'Không thể xử lý QR', [
        { text: 'Quét lại', onPress: resetScan }
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : (handleBarCodeScanned as any)}
      />
      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.scanFrame} />
        <Text style={styles.hint}>Đưa mã QR vào khung</Text>
      </View>
      {scanned && (
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.retryBtn} onPress={resetScan}>
            <Text style={styles.retryText}>Quét lại</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.closeText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  infoText: { color: '#fff', marginBottom: 12 },
  requestBtn: { backgroundColor: Colors.white, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  requestBtnText: { color: Colors.primary, fontWeight: 'bold' },
  overlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  scanFrame: {
    width: 240,
    height: 240,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#fff',
    opacity: 0.9,
  },
  hint: { color: '#fff', marginTop: 14, fontWeight: '600' },
  bottomBar: { position: 'absolute', bottom: 28, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center' },
  retryBtn: { backgroundColor: Colors.white, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 10 },
  retryText: { color: Colors.primary, fontWeight: '700' },
  closeBtn: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  closeText: { color: '#fff', fontWeight: '700' },
});


