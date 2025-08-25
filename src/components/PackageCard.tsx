import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Shadows } from '../constants/colors';
import { Package } from '../types';

interface PackageCardProps {
  package: Package;
  onSelect: (pkg: Package) => void;
  successCount?: number;
}

export const PackageCard: React.FC<PackageCardProps> = ({ package: pkg, onSelect, successCount }) => {
  // fallback for API data
  const benefits = Array.isArray(pkg.benefits) ? pkg.benefits : [];
  const imageUrl = pkg.image || pkg.imageUrl || '';
  const duration = pkg.duration || pkg.durationDays || '';
  const cupsPerDay = pkg.cupsPerDay || pkg.dailyQuota || '';

  return (
    <TouchableOpacity 
      style={[styles.card, pkg.popular && styles.popularCard]} 
      onPress={() => onSelect(pkg)}
      activeOpacity={0.95}
    >
      {pkg.popular && (
        <View style={styles.popularBadge}>
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
          {cupsPerDay ? `${cupsPerDay} ly cà phê mỗi ngày` : pkg.description}
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

        {successCount && successCount > 0 && (
          <Text style={{ textAlign: 'center', marginBottom: 8, color: Colors.primary }}>
            Đã đăng ký thành công: {successCount} lần
          </Text>
        )}

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
});