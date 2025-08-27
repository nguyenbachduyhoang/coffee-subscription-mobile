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
if (Constants.appOwnership !== 'expo') {
  try {
    Notifications = require('expo-notifications');
  } catch {}
}

const Stack = createStackNavigator();

export default function App() {
  // Firebase push disabled per user request

  // Global polling of notifications (when app is in foreground)
  useEffect(() => {
    let interval: any = null;
    const poll = async () => {
      try {
        const userJson = await AsyncStorage.getItem('token');
        const token = userJson || '';
        if (!token) return;
        const res = await notificationsApi.getNotifications(token);
        const latest = (res || [])[0];
        if (!latest) return;
        const lastId = await AsyncStorage.getItem('last_notification_id');
        if (String(latest.notificationId) !== String(lastId)) {
          await AsyncStorage.setItem('last_notification_id', String(latest.notificationId));
          // Show local push notification for new notifications
          if (Notifications && Constants.appOwnership !== 'expo') {
            try {
              await Notifications.scheduleNotificationAsync({
                content: { 
                  title: latest.title || 'Thông báo mới', 
                  body: latest.body || 'Bạn có thông báo mới từ hệ thống' 
                },
                trigger: null, // Show immediately
              });
            } catch (error) {
              console.log('Local notification failed:', error);
            }
          }
        }
      } catch {}
    };
    // start
    poll();
    interval = setInterval(poll, 20000);
    return () => { if (interval) clearInterval(interval); };
  }, []);
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <StatusBar style="dark" backgroundColor="#F8EFE6" />
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
