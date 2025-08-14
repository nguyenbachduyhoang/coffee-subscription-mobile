import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/components/AuthProvider';

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="dark" backgroundColor="#F8EFE6" />
      <AppNavigator />
    </AuthProvider>
  );
}
