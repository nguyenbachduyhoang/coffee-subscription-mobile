import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Bell } from 'lucide-react-native';
import { Colors, Shadows } from '../../constants/colors';

const notifications = [
  {
    id: '1',
    title: 'Chào mừng bạn đến với Coffee Subscription!',
    description: 'Bạn vừa đăng ký thành công tài khoản.',
    time: '1 phút trước',
  },
  {
    id: '2',
    title: 'Ưu đãi tháng 8',
    description: 'Nhận ngay mã giảm giá 10% cho gói Premium.',
    time: '2 giờ trước',
  },
];

const NotificationItem = ({ item }: { item: typeof notifications[0] }) => (
  <View style={styles.card}>
    <View style={styles.iconWrap}>
      <Bell size={24} color={Colors.primary} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.desc}>{item.description}</Text>
      <Text style={styles.time}>{item.time}</Text>
    </View>
  </View>
);

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.headerWrap}>
        <Text style={styles.header}>Thông báo</Text>
      </View>
      {notifications.length === 0 ? (
        <View style={styles.empty}>
          <Bell size={48} color={Colors.gray[400]} />
          <Text style={styles.emptyText}>Chưa có thông báo nào</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <NotificationItem item={item} />}
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.primary,
    marginBottom: 4,
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
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.gray[400],
    fontFamily: 'Poppins-Regular',
    marginTop: 16,
  },
});
