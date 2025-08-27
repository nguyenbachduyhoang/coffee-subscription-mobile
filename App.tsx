import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider, AuthContext } from './src/components/AuthProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import Constants from 'expo-constants';
import { notificationsApi } from './src/services/api';

// Conditionally import expo-notifications to avoid Expo Go warnings
let Notifications: any = null;
try {
  Notifications = require('expo-notifications');
  // Foreground display behavior (SDK 53: use banner/list flags)
  Notifications.setNotificationHandler?.({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    })
  });
} catch {}

const Stack = createStackNavigator();

function PushRegistrar() {
  const auth = React.useContext(AuthContext);
  useEffect(() => {
    (async () => {
      if (!Notifications) return;
      // Ensure Android channel for heads-up notifications
      if (Notifications.setNotificationChannelAsync) {
        try {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Default',
            importance: Notifications.AndroidImportance?.MAX ?? 5,
            vibrationPattern: [0, 200, 100, 200],
            lockscreenVisibility: Notifications.AndroidNotificationVisibility?.PUBLIC ?? 1,
            sound: undefined,
            lightColor: '#FFAA66',
          });
        } catch {}
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!Notifications || !auth?.user?.id) return;
      try {
        const perms = await Notifications.getPermissionsAsync();
        if (!perms.granted) await Notifications.requestPermissionsAsync();
        const projectId = (Constants as any)?.expoConfig?.extra?.eas?.projectId;
        const tokenObj = await Notifications.getExpoPushTokenAsync({ projectId });
        const pushToken = tokenObj.data;
        await AsyncStorage.setItem('push_token', pushToken);
        // Upload to backend so customer can receive server push
        await notificationsApi.registerDevice?.(auth.user.id, pushToken);
      } catch {}
    })();
  }, [auth?.user?.id]);
  return null;
}

export default function App() {
  // Global polling of notifications (when app is in foreground)
  useEffect(() => {
    let interval: any = null;
    const poll = async () => {
      try {
        const token = (await AsyncStorage.getItem('token')) || '';
        if (!token) return;
        const res = await notificationsApi.getNotifications(token);
        const latest = (res || [])[0];
        if (!latest) return;
        const lastId = await AsyncStorage.getItem('last_notification_id');
        if (String(latest.notificationId) !== String(lastId)) {
          await AsyncStorage.setItem('last_notification_id', String(latest.notificationId));
          await AsyncStorage.setItem('has_unread', '1');
          if (Notifications?.scheduleNotificationAsync) {
            try {
              await Notifications.scheduleNotificationAsync({
                content: { title: latest.title || 'Thông báo mới', body: latest.body || 'Bạn có thông báo mới từ hệ thống' },
                trigger: null,
                android: { channelId: 'default', priority: Notifications.AndroidNotificationPriority?.MAX ?? 2 },
              });
            } catch {}
          }
        }
      } catch {}
    };
    poll();
    interval = setInterval(poll, 20000);
    return () => { if (interval) clearInterval(interval); };
  }, []);

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <StatusBar style="dark" backgroundColor="#F8EFE6" />
        <PushRegistrar />
        <RoleRouter />
      </SafeAreaProvider>
    </AuthProvider>
  );
}

function RoleRouter() {
  const auth = React.useContext(AuthContext);
  console.log('RoleRouter user:', auth?.user);

  if (!auth?.user) {
    // Chưa đăng nhập, show navigator mặc định
    return <AppNavigator />;
  }
  if (auth.user.role === 'staff' || auth.user.role === 'barista') {
    console.log('Chuyển sang màn hình staff');
    // Tạo navigation stack riêng cho staff
    const StaffOrderScreen = require('./src/screens/StaffOrderScreen').default;
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="StaffOrderScreen" component={StaffOrderScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
  // Mặc định là customer
  return <AppNavigator />;
}
