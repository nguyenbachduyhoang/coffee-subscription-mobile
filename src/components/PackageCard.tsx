import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Shadows } from '../constants/colors';
import { Package } from '../types';

interface PackageCardProps {
  package: Package;
  onSelect: (pkg: Package) => void;
  onCardPress?: (pkg: Package) => void;
  successCount?: number;
}

export const PackageCard: React.FC<PackageCardProps> = ({ package: pkg, onSelect, onCardPress, successCount }) => {
  // fallback for API data
  const benefits = Array.isArray(pkg.benefits) ? pkg.benefits : [];
  const imageUrl = pkg.image || pkg.imageUrl || '';
  const duration = pkg.duration || pkg.durationDays || '';
  const cupsPerDay = pkg.cupsPerDay || pkg.dailyQuota || '';

  const handleCardPress = () => {
    if (onCardPress) {
      onCardPress(pkg);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.card, pkg.popular && styles.popularCard]} 
      onPress={handleCardPress}
      activeOpacity={0.95}
      accessibilityLabel={`Gói ${pkg.name}`}
    >
      {pkg.popular && (
        <View style={styles.popularBadge} accessibilityLabel="Gói phổ biến nhất">
          <Text style={styles.popularText}>PHỔ BIẾN NHẤT</Text>
        </View>
      )}

      <Image source={{ uri: imageUrl }} style={styles.image} />

      <View style={styles.content}>
        <Text style={styles.packageName}>{pkg.name}</Text>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            {pkg.price.toLocaleString('vi-VN')}₫
          </Text>
          <Text style={styles.duration}>/{duration}</Text>
        </View>

        <Text style={styles.description}>
          {cupsPerDay ? `${cupsPerDay} ly cà phê mỗi ngày` : (pkg.description || '')}
        </Text>

        {benefits.length > 0 && (
          <View style={styles.benefits}>
            {benefits.slice(0, 2).map((benefit, index) => (
              <Text key={index} style={styles.benefit}>
                • {benefit}
              </Text>
            ))}
          </View>
        )}

        {successCount && successCount > 0 ? (
          <View style={styles.successBadge}>
            <Text style={styles.successText}>
              <Text>Đã đăng ký thành công: </Text>
              <Text style={{ fontWeight: 'bold' }}>{successCount} lần</Text>
            </Text>
          </View>
        ) : null}

        <TouchableOpacity 
          style={styles.selectButton}
          onPress={() => onSelect(pkg)}
        >
          <Text style={styles.selectButtonText}>
            {successCount && successCount > 0 ? 'Đăng ký thêm' : 'Đăng Ký Ngay'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  popularCard: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  popularBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 1,
  },
  popularText: {
    color: Colors.white,
    fontSize: 10,
    fontFamily: 'Poppins-SemiBold',
  },
  image: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  packageName: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.primary,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: Colors.primary,
  },
  duration: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: Colors.gray[600],
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: Colors.gray[700],
    marginBottom: 12,
  },
  benefits: {
    marginBottom: 16,
  },
  benefit: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: Colors.gray[600],
    marginBottom: 4,
  },
  selectButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  selectButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#e6f9ed',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginBottom: 12,
    marginTop: 6,
  },
  successText: {
    color: Colors.success,
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
});