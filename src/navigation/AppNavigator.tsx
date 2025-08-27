import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Chrome as HomeIcon, Package as PackageIcon, User as UserIcon } from 'lucide-react-native';
import { Bell as BellIcon } from 'lucide-react-native';
import { QrCode as QrCodeIcon } from 'lucide-react-native';
import { View } from 'react-native';
import HomeScreen from '../screens/Home/Home';
import PackagesScreen from '../screens/Packages/packages';
import ProfileScreen from '../screens/Profile/Profile';
import BenefitsScreen from '../screens/Benefits/benefits';
import ContactScreen from '../screens/Contact/contact';
import HistoryScreen from '../screens/History/HistoryScreen';
import { Colors } from '../constants/colors';
import { useAuth } from '../hooks/useAuth';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
  const { user } = useAuth();
  const isStaff = user?.role === 'staff' || user?.role === 'barista';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray[500],
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.gray[200],
          paddingTop: 8,
          paddingBottom: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontFamily: 'Poppins-Medium',
          fontSize: 12,
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Trang Chủ',
          tabBarIcon: ({ size, color }) => <HomeIcon size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Packages"
        component={PackagesScreen}
        options={{
          title: 'Gói Dịch Vụ',
          tabBarIcon: ({ size, color }) => <PackageIcon size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="QRCode"
        component={require('../screens/QRCode/QRCode').default}
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <View style={{
              backgroundColor: focused ? '#4E342E' : '#fff',
              borderRadius: 32,
              padding: 8,
              marginTop: -24,
              borderWidth: 3,
              borderColor: '#4E342E',
              shadowColor: Colors.primary,
              shadowOpacity: focused ? 0.2 : 0.08,
              shadowRadius: focused ? 8 : 4,
              elevation: focused ? 8 : 2,
            }}>
              <QrCodeIcon size={48} color={focused ? '#fff' : '#4E342E'} />
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={require('../screens/Notifications/NotificationsScreen').default}
        options={{
          title: 'Thông báo',
          tabBarIcon: ({ size, color }) => (
            <BellIcon size={size} color={color} />
          ),
        }}
      />
      {/* Chỉ hiển thị Profile tab cho customer */}
      {!isStaff && (
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            title: 'Cá Nhân',
            tabBarIcon: ({ size, color }) => <UserIcon size={size} color={color} />,
          }}
        />
      )}
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Benefits" component={BenefitsScreen} />
        <Stack.Screen name="Contact" component={ContactScreen} />
        <Stack.Screen name="MenuScreen" component={require('../screens/Menu/MenuScreen').default} />
        <Stack.Screen name="PaymentScreen" component={require('../screens/Payment/PaymentScreen').default} />
        <Stack.Screen name="HistoryScreen" component={HistoryScreen} />
        <Stack.Screen name="QRScanner" component={require('../screens/QRScanner/QRScannerScreen').default} />
        <Stack.Screen name="StaffOrderScreen" component={require('../screens/StaffOrderScreen').default} />
        <Stack.Screen name="PackageDetail" component={require('../screens/PackageDetail/PackageDetail').default} />
        {/* Thêm các màn hình chi tiết khác ở đây nếu cần */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
