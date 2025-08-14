import React, { useState } from 'react';
// Màn hình này được sử dụng cho tab "Trang Chủ" (index) trong thanh điều hướng chính.
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Coffee, ArrowRight } from 'lucide-react-native';
import { Colors, Shadows } from '../../constants/colors';
import { PACKAGES } from '../../constants/data';
import { PackageCard } from '../../components/PackageCard';
import { AuthModal } from '../../components/AuthModal';
import { useAuth } from '../../hooks/useAuth';
import { router } from 'expo-router';
import { Package } from '../../types';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();

  const handlePackageSelect = (pkg: Package) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    router.push({
      pathname: '/payment',
      params: { packageId: pkg.id }
    });
  };

  const featuredPackages = PACKAGES.slice(0, 2);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <LinearGradient
        colors={[Colors.primary, '#6B4C49']}
        style={styles.hero}
      >
        <View style={styles.heroContent}>
          <Coffee size={48} color={Colors.secondary} />
          <Text style={styles.heroTitle}>
            Cà Phê Subscription{'\n'}Premium
          </Text>
          <Text style={styles.heroSubtitle}>
            Thưởng thức cà phê tươi mỗi ngày với gói đăng ký tiết kiệm
          </Text>
          
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => !user ? setShowAuthModal(true) : router.push('/packages')}
          >
            <Text style={styles.ctaButtonText}>Đăng Ký Ngay</Text>
            <ArrowRight size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        
        <Image
          source={{ uri: 'https://images.pexels.com/photos/1251175/pexels-photo-1251175.jpeg?auto=compress&cs=tinysrgb&w=800' }}
          style={styles.heroImage}
        />
      </LinearGradient>

      {/* Welcome Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {user ? `Chào mừng, ${user.name}!` : 'Chào Mừng Đến Coffee Club'}
        </Text>
        <Text style={styles.sectionSubtitle}>
          Khám phá những gói cà phê subscription phù hợp với bạn
        </Text>
      </View>

      {/* Featured Packages */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Gói Nổi Bật</Text>
          <TouchableOpacity onPress={() => router.push('/packages')}>
            <Text style={styles.viewAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
        
        {featuredPackages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            package={pkg}
            onSelect={handlePackageSelect}
          />
        ))}
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <LinearGradient
          colors={[Colors.secondary, Colors.accent]}
          style={styles.statsContainer}
        >
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>1000+</Text>
              <Text style={styles.statLabel}>Khách hàng hài lòng</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>50+</Text>
              <Text style={styles.statLabel}>Loại cà phê</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>24/7</Text>
              <Text style={styles.statLabel}>Hỗ trợ khách hàng</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>100%</Text>
              <Text style={styles.statLabel}>Cà phê tươi</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  hero: {
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  heroContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  heroImage: {
    position: 'absolute',
    right: -50,
    bottom: -20,
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.3,
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: Colors.white,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: Colors.secondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  ctaButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 25,
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ctaButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.primary,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: Colors.gray[600],
    marginTop: 4,
    lineHeight: 20,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: Colors.primary,
  },
  statsSection: {
    padding: 20,
    paddingBottom: 40,
  },
  statsContainer: {
    borderRadius: 16,
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: Colors.gray[700],
    textAlign: 'center',
    marginTop: 4,
  },
});