import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider, AuthContext } from './src/components/AuthProvider';

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="dark" backgroundColor="#F8EFE6" />
      <RoleRouter />
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
    const StaffOrderScreen = require('./src/screens/StaffOrderScreen').default;
    return <StaffOrderScreen />;
  }
  // Mặc định là customer
  return <AppNavigator />;
}
