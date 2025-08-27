import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Bell } from 'lucide-react-native';
import { Colors, Shadows } from '../../constants/colors';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { notificationApi, AppNotification } from '../../services/notificationApi';

// Optional: present foreground notifications (adjust to match SDK)
// Skip configuring notifications on Expo Go (no remote notifications there)
// We also avoid dynamic imports to satisfy TS module settings.

const NotificationItem = ({ item }: { item: AppNotification }) => (
  <View style={[styles.card, item.status !== 'Read' && styles.unreadCard]}>
    <View style={[styles.iconWrap, item.status !== 'Read' && styles.unreadIconWrap]}>
      <Bell size={24} color={item.status === 'Read' ? Colors.gray[400] : Colors.primary} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={[styles.title, item.status !== 'Read' && styles.unreadTitle]}>{item.title}</Text>
      <Text style={styles.desc}>{item.body}</Text>
      <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
    </View>
    {item.status !== 'Read' && <View style={styles.unreadDot} />}
  </View>
);

export default function NotificationsScreen() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const latestIdRef = useRef<number | undefined>(undefined);
  const pollingRef = useRef<any>(null);

  const fetchData = async () => {
    try {
      const userData = await SecureStore.getItemAsync('user');
      const parsed = userData ? JSON.parse(userData) : null;
      const token = parsed?.token || (await AsyncStorage.getItem('token')) || '';
      if (!token) { setItems([]); return; }
      const res = await notificationApi.getNotifications(token);
      setItems(res || []);
      const latest = (res || [])[0];
      if (latest && latest.notificationId !== latestIdRef.current) {
        latestIdRef.current = latest.notificationId;
        // Note: On Expo Go we won't schedule local notifications here to avoid SDK warnings.
      }
    } catch {
      // ignore
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    // initial load
    fetchData();
    // start polling every 20s
    pollingRef.current = setInterval(fetchData, 20000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerWrap}>
        <Text style={styles.header}>Thông báo</Text>
      </View>
      <FlatList
        data={items}
        keyExtractor={item => String(item.notificationId)}
        renderItem={({ item }) => <NotificationItem item={item} />}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: Colors.gray[400], marginTop: 40 }}>Chưa có thông báo</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  headerWrap: {
    marginBottom: 24,
  },
  header: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: Colors.primary,
    textAlign: 'left',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...Shadows.medium,
  },
  unreadCard: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  unreadIconWrap: {
    backgroundColor: Colors.secondary,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.primary,
    marginBottom: 4,
  },
  unreadTitle: {
    color: Colors.primary,
  },
  desc: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: Colors.gray[700],
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: Colors.gray[500],
    fontFamily: 'Poppins-Regular',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginLeft: 12,
  },
});
