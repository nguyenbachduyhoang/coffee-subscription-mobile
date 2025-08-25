import React, { useState } from 'react';
// Màn hình này được sử dụng cho tab "Liên Hệ" (contact) trong thanh điều hướng chính.
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { MapPin, Phone, Mail, Clock } from 'lucide-react-native';
import { Colors, Shadows } from '../../constants/colors';
import { contactApi } from '../../services/api';
import { ContactMessage } from '../../types';

export default function ContactScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !phone || !message) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }

    setIsLoading(true);

    try {
      await contactApi.sendMessage({
        name,
        email,
        phone,
        message,
      });
      
      Alert.alert(
        'Thành công',
        'Tin nhắn của bạn đã được gửi. Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất!',
        [{ text: 'OK', onPress: resetForm }]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setMessage('');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Liên Hệ</Text>
        <Text style={styles.headerSubtitle}>
          Chúng tôi luôn sẵn sàng hỗ trợ bạn
        </Text>
      </View>

      {/* Contact Info */}
      <View style={styles.contactInfo}>
        <View style={styles.contactItem}>
          <View style={styles.contactIcon}>
            <MapPin size={20} color={Colors.primary} />
          </View>
          <View style={styles.contactContent}>
            <Text style={styles.contactLabel}>Địa chỉ</Text>
            <Text style={styles.contactValue}>
              123 Nguyễn Văn Linh, Quận 7, TP.HCM
            </Text>
          </View>
        </View>

        <View style={styles.contactItem}>
          <View style={styles.contactIcon}>
            <Phone size={20} color={Colors.primary} />
          </View>
          <View style={styles.contactContent}>
            <Text style={styles.contactLabel}>Điện thoại</Text>
            <Text style={styles.contactValue}>0901 234 567</Text>
          </View>
        </View>

        <View style={styles.contactItem}>
          <View style={styles.contactIcon}>
            <Mail size={20} color={Colors.primary} />
          </View>
          <View style={styles.contactContent}>
            <Text style={styles.contactLabel}>Email</Text>
            <Text style={styles.contactValue}>info@coffeeclub.vn</Text>
          </View>
        </View>

        <View style={styles.contactItem}>
          <View style={styles.contactIcon}>
            <Clock size={20} color={Colors.primary} />
          </View>
          <View style={styles.contactContent}>
            <Text style={styles.contactLabel}>Giờ làm việc</Text>
            <Text style={styles.contactValue}>
              Thứ 2 - Chủ nhật: 6:00 - 22:00
            </Text>
          </View>
        </View>
      </View>

      {/* Contact Form */}
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Gửi Tin Nhắn</Text>
        
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Họ và tên"
            value={name}
            onChangeText={setName}
            placeholderTextColor={Colors.gray[400]}
          />
          
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
            placeholder="Số điện thoại"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholderTextColor={Colors.gray[400]}
          />
          
          <TextInput
            style={[styles.input, styles.messageInput]}
            placeholder="Tin nhắn của bạn..."
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor={Colors.gray[400]}
          />

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Đang gửi...' : 'Gửi Tin Nhắn'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: Colors.gray[600],
    lineHeight: 20,
  },
  contactInfo: {
    padding: 20,
    gap: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    ...Shadows.small,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactContent: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: Colors.gray[500],
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.primary,
  },
  formContainer: {
    padding: 20,
    backgroundColor: Colors.gray[50],
  },
  formTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.primary,
    marginBottom: 20,
    textAlign: 'center',
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
    backgroundColor: Colors.white,
  },
  messageInput: {
    height: 100,
    paddingTop: 16,
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
});