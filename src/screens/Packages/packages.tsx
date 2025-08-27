import React, { useState, useEffect } from 'react';
// Màn hình này được sử dụng cho tab "Gói Dịch Vụ" (packages) trong thanh điều hướng chính.
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Filter } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { getAllPlans, Plan } from '../../services/packageApi';
import { PackageCard } from '../../components/PackageCard';
import { AuthModal } from '../../components/AuthModal';
import { useAuth } from '../../hooks/useAuth';
import { subscriptionsApi } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

function PackagesScreen() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const { user } = useAuth();
  const navigation = useNavigation();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await getAllPlans();
        if (!cancelled) {
          setPlans(data);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          console.log('No token found for subscriptions');
          setSubscriptions([]);
          return;
        }
        
        console.log('Fetching subscriptions with token:', token ? 'Token exists' : 'No token');
        const data = await subscriptionsApi.getMySubscriptions(token);
        console.log('Subscriptions data:', data ? `Got ${Array.isArray(data) ? data.length : 0} items` : 'No data');
        
        if (data && Array.isArray(data)) {
          setSubscriptions(data);
        } else {
          console.log('Subscriptions data is not an array:', typeof data);
          setSubscriptions([]);
        }
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
        setSubscriptions([]);
      }
    };
    
    // Only fetch if user is logged in
    if (user) {
      fetchSubscriptions();
    } else {
      setSubscriptions([]);
    }
  }, [user]);

  const handlePackageSelect = (plan: Plan) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    (navigation as any).navigate('PaymentScreen', { planId: plan.planId });
  };

  const handlePackageDetail = (plan: Plan) => {
    (navigation as any).navigate('PackageDetail', { plan });
  };

  const filteredPlans = plans.filter(plan => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'basic') return plan.dailyQuota === 1;
    if (selectedFilter === 'premium') return plan.dailyQuota >= 3;
    return true;
  });

  const getSuccessCount = (planId: number) => {
    if (!Array.isArray(subscriptions)) return 0;
    return subscriptions.filter(
      sub => sub.planId === planId && sub.status === 'Active'
    ).length;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 40, color: Colors.primary }}>Đang tải gói dịch vụ...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gói Dịch Vụ</Text>
        <View style={styles.filterButton}>
          <Filter size={20} color={Colors.primary} />
          <Text style={styles.filterButtonText}>Lọc</Text>
        </View>
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

      {/* Plans List */}
      <ScrollView 
        style={styles.packagesContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.packagesContent}
      >
        <Text style={styles.sectionSubtitle}>
          Chọn gói phù hợp với nhu cầu của bạn
        </Text>
        {filteredPlans.map(plan => {
          // Ensure all values are valid before passing to component
          const safePackage = {
            id: String(plan.planId || ''),
            name: typeof plan.name === 'string' ? plan.name : '',
            price: typeof plan.price === 'number' ? plan.price : 0,
            duration: String(plan.durationDays || ''),
            cupsPerDay: typeof plan.dailyQuota === 'number' ? plan.dailyQuota : 0,
            image: typeof plan.imageUrl === 'string' ? plan.imageUrl : '',
            benefits: [], // Always empty array
            popular: false,
          };
          
          return (
            <PackageCard
              key={plan.planId}
              package={safePackage}
              onSelect={() => handlePackageSelect(plan)}
              onCardPress={() => handlePackageDetail(plan)}
              successCount={getSuccessCount(plan.planId)}
            />
          );
        })}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: Colors.primary,
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