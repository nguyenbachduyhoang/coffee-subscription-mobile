import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { subscriptionsApi } from '../../services/api';

type Subscription = {
  subscriptionId: number;
  planName: string;
  productName: string;
  imageUrl: string;
  createdAt: string;
  status: string;
};

const FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'paid', label: 'Đã thanh toán' },
  { key: 'unpaid', label: 'Chưa thanh toán' },
];

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'PendingPayment':
      return 'Chưa thanh toán';
    case 'Cancelled':
      return 'Đã hủy';
    case 'Active':
      return 'Đã thanh toán';
    default:
      return status;
  }
};

export default function PurchaseHistoryScreen() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      try {
        const data = await subscriptionsApi.getMySubscriptions(token || '');
        setSubscriptions(data);
      } catch (e) {
        setSubscriptions([]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredData = subscriptions.filter(sub => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'paid') return sub.status === 'Active';
    if (selectedFilter === 'unpaid') return sub.status === 'PendingPayment';
    return true;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Lịch Sử Mua Hàng</Text>
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterBtn,
              selectedFilter === f.key && styles.filterBtnActive,
            ]}
            onPress={() => setSelectedFilter(f.key)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === f.key && styles.filterTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color={Colors.primary} />
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={item => item.subscriptionId.toString()}
          contentContainerStyle={{ paddingBottom: 32 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
              <View style={styles.info}>
                <Text style={styles.planName}>{item.planName}</Text>
                <Text style={styles.productName}>{item.productName}</Text>
                <Text style={styles.date}>
                  {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                </Text>
                <View style={[
                  styles.statusBadge,
                  item.status === 'Active'
                    ? styles.statusPaid
                    : item.status === 'PendingPayment'
                    ? styles.statusUnpaid
                    : styles.statusCancelled,
                ]}>
                  <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Không có giao dịch nào</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingTop: 48,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 18,
    textAlign: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 18,
    gap: 12,
  },
  filterBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
  },
  filterBtnActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 15,
    color: Colors.gray[600],
    fontWeight: '500',
  },
  filterTextActive: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    alignItems: 'center',
    shadowColor: '#8D5B3F',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3e7db',
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: '#f8f4f0',
    borderWidth: 1,
    borderColor: '#f3e7db',
  },
  info: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 2,
  },
  productName: {
    fontSize: 14,
    color: Colors.gray[700],
    marginBottom: 2,
  },
  date: {
    fontSize: 13,
    color: Colors.gray[600],
    marginBottom: 6,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 2,
  },
  statusPaid: {
    backgroundColor: Colors.success,
  },
  statusUnpaid: {
    backgroundColor: Colors.warning,
  },
  statusCancelled: {
    backgroundColor: Colors.gray[300],
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.white,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.gray[500],
    fontSize: 15,
    marginTop: 32,
  },
});