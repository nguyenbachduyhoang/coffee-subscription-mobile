import React from 'react';
// Màn hình này được sử dụng cho tab "Lợi Ích" (benefits) trong thanh điều hướng chính.
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import { 
  Coffee, 
  PiggyBank, 
  Truck, 
  Award, 
  Settings, 
  Headphones 
} from 'lucide-react-native';
import { Colors, Shadows } from '../../constants/colors';
import { BENEFITS } from '../../constants/data';

const iconMap = {
  'coffee': Coffee,
  'piggy-bank': PiggyBank,
  'truck': Truck,
  'award': Award,
  'settings': Settings,
  'headphones': Headphones,
};

export default function BenefitsScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lợi Ích</Text>
        <Text style={styles.headerSubtitle}>
          Những giá trị tuyệt vời khi đăng ký gói subscription
        </Text>
      </View>

      <Image
        source={{ uri: 'https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg?auto=compress&cs=tinysrgb&w=800' }}
        style={styles.heroImage}
      />

      <View style={styles.benefitsContainer}>
        {BENEFITS.map((benefit, index) => {
          const IconComponent = iconMap[benefit.icon as keyof typeof iconMap];
          
          return (
            <View key={benefit.id} style={styles.benefitCard}>
              <View style={styles.benefitIcon}>
                <IconComponent size={24} color={Colors.primary} />
              </View>
              
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>{benefit.title}</Text>
                <Text style={styles.benefitDescription}>
                  {benefit.description}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Why Choose Us Section */}
      <View style={styles.whySection}>
        <Text style={styles.whySectionTitle}>Tại Sao Chọn Chúng Tôi?</Text>
        
        <View style={styles.featureGrid}>
          <View style={styles.featureCard}>
            <Text style={styles.featureNumber}>5+</Text>
            <Text style={styles.featureLabel}>Năm kinh nghiệm</Text>
          </View>
          
          <View style={styles.featureCard}>
            <Text style={styles.featureNumber}>100%</Text>
            <Text style={styles.featureLabel}>Cà phê Arabica</Text>
          </View>
          
          <View style={styles.featureCard}>
            <Text style={styles.featureNumber}>24h</Text>
            <Text style={styles.featureLabel}>Giao hàng nhanh</Text>
          </View>
          
          <View style={styles.featureCard}>
            <Text style={styles.featureNumber}>30%</Text>
            <Text style={styles.featureLabel}>Tiết kiệm chi phí</Text>
          </View>
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
  heroImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  benefitsContainer: {
    padding: 20,
    gap: 16,
  },
  benefitCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    ...Shadows.small,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.primary,
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: Colors.gray[600],
    lineHeight: 20,
  },
  whySection: {
    padding: 20,
    backgroundColor: Colors.gray[50],
  },
  whySectionTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    ...Shadows.small,
  },
  featureNumber: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  featureLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: Colors.gray[600],
    textAlign: 'center',
  },
});