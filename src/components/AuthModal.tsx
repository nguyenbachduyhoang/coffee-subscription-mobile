import React, { useState } from 'react';
import {
  View,
  TouchableWithoutFeedback,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { X } from 'lucide-react-native';
import { Colors, Shadows } from '../constants/colors';
import { login as apiLogin, register as apiRegister } from '../services/authApi';
import { verifyEmail } from '../services/authApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ visible, onClose }) => {
  const [showVerify, setShowVerify] = useState(false);
  const [verifyToken, setVerifyToken] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [registerEmail, setRegisterEmail] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const translateY = useSharedValue(300);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0);
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(300);
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: interpolate(opacity.value, [0, 1], [0, 1]),
  }));

  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setIsLoading(true);
    
    try {
      let result;
      if (isLogin) {
        result = await apiLogin(email, password);
        console.log('Login result (token):', result);
        if (result) {
          await AsyncStorage.setItem('token', result);
        }
      } else {
        result = await apiRegister({ name, email, password, phone: '', address: '' });
        console.log('Register result:', result);
        if (result) {
          setShowVerify(true);
          setRegisterEmail(email);
        }
      }
      if (isLogin && result) {
        resetForm();
        onClose();
      } else if (!isLogin && result) {
        resetForm();
      } else {
        Alert.alert('Lỗi', 'Thao tác thất bại. Vui lòng thử lại.');
      }
    } catch (error) {
      console.log('Error in handleSubmit:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verifyToken) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã xác thực');
      return;
    }
    setVerifyLoading(true);
    try {
      const result = await verifyEmail(verifyToken);
      if (result.success) {
        Alert.alert('Thành công', 'Xác thực email thành công!');
        setShowVerify(false);
        setVerifyToken('');
        setRegisterEmail('');
        setIsLogin(true);
      } else {
        Alert.alert('Lỗi', result.message || 'Mã xác thực không hợp lệ hoặc đã hết hạn');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.background, backgroundStyle]}>
          <BlurView intensity={20} style={StyleSheet.absoluteFill} />
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
          >
            <TouchableWithoutFeedback>
              <Animated.View style={[styles.modal, animatedStyle]}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <X size={24} color={Colors.gray[500]} />
                </TouchableOpacity>
                {showVerify ? (
                  <>
                    <Text style={styles.title}>Xác Thực Email</Text>
                    <Text style={{ textAlign: 'center', marginBottom: 16 }}>
                      Vui lòng nhập mã xác thực đã gửi về email <Text style={{ fontWeight: 'bold' }}>{registerEmail}</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Mã xác thực"
                      value={verifyToken}
                      onChangeText={setVerifyToken}
                      keyboardType="number-pad"
                      placeholderTextColor={Colors.gray[400]}
                    />
                    <TouchableOpacity
                      style={[styles.submitButton, verifyLoading && styles.submitButtonDisabled]}
                      onPress={handleVerify}
                      disabled={verifyLoading}
                    >
                      <Text style={styles.submitButtonText}>
                        {verifyLoading ? 'Đang xác thực...' : 'Xác Thực'}
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={styles.title}>
                      {isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
                    </Text>
                    <View style={styles.form}>
                      {!isLogin && (
                        <TextInput
                          style={styles.input}
                          placeholder="Họ và tên"
                          value={name}
                          onChangeText={setName}
                          placeholderTextColor={Colors.gray[400]}
                        />
                      )}
                      <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholderTextColor={Colors.gray[400]}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Mật khẩu"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholderTextColor={Colors.gray[400]}
                      />
                      <TouchableOpacity
                        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={isLoading}
                      >
                        <Text style={styles.submitButtonText}>
                          {isLoading ? 'Đang xử lý...' : (isLogin ? 'Đăng Nhập' : 'Đăng Ký')}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={toggleMode} style={styles.toggleButton}>
                        <Text style={styles.toggleText}>
                          {isLogin ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </Animated.View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    ...Shadows.large,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    backgroundColor: Colors.gray[50],
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.gray[400],
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  toggleButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  toggleText: {
    color: Colors.primary,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
});