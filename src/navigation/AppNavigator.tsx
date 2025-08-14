import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Chrome as HomeIcon, Package as PackageIcon, User as UserIcon } from 'lucide-react-native';
import HomeScreen from '../screens/Home';
import PackagesScreen from '../screens/Packages/packages';
import ProfileScreen from '../screens/Profile/profile';
import BenefitsScreen from '../screens/Benefits/benefits';
import ContactScreen from '../screens/Contact/contact';
import { Colors } from '../constants/colors';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
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
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Cá Nhân',
          tabBarIcon: ({ size, color }) => <UserIcon size={size} color={color} />,
        }}
      />
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
        {/* Thêm các màn hình chi tiết khác ở đây nếu cần */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
