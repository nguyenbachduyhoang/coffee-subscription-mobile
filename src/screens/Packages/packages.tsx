import React, { useState } from 'react';
// Màn hình này được sử dụng cho tab "Gói Dịch Vụ" (packages) trong thanh điều hướng chính.
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Filter } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { PACKAGES } from '../../constants/data';
import { PackageCard } from '../../components/PackageCard';
import { AuthModal } from '../../components/AuthModal';
import { useAuth } from '../../hooks/useAuth';
import { router } from 'expo-router';
import { Package } from '../../types';

function PackagesScreen() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
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

  const filteredPackages = PACKAGES.filter(pkg => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'basic') return pkg.cupsPerDay === 1;
    if (selectedFilter === 'premium') return pkg.cupsPerDay >= 3;
    return true;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gói Dịch Vụ</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {[
          { key: 'all', label: 'Tất cả' },
          { key: 'basic', label: 'Cơ bản' },
          { key: 'premium', label: 'Premium' },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterTab,
              selectedFilter === filter.key && styles.filterTabActive
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Text style={[
              styles.filterTabText,
              selectedFilter === filter.key && styles.filterTabTextActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Packages List */}
      <ScrollView 
        style={styles.packagesContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.packagesContent}
      >
        <Text style={styles.sectionSubtitle}>
          Chọn gói phù hợp với nhu cầu của bạn
        </Text>
        
        {filteredPackages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            package={pkg}
            onSelect={handlePackageSelect}
          />
        ))}
      </ScrollView>

      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: Colors.primary,
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.secondary,
  },
  filterContainer: {
    maxHeight: 50,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
  },
  filterTabText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: Colors.gray[600],
  },
  filterTabTextActive: {
    color: Colors.white,
  },
  packagesContainer: {
    flex: 1,
  },
  packagesContent: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: Colors.gray[600],
    marginBottom: 20,
    lineHeight: 20,
  },
});

export default PackagesScreen;