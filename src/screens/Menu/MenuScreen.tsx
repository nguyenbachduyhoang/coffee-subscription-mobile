import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, SafeAreaView, TouchableOpacity, StyleSheet, Platform, StatusBar, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ProductCard from '../../components/ProductCard';
import { ArrowLeft } from 'lucide-react-native';
import { productsApi } from '../../services/api';

// Import Product interface from api.ts
export interface Product {
  productId: number;
  category: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

const MenuScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productsApi.getAllProducts();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#8D5B3F" />;
  }

  // Filter products by search
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>Menu</Text>
        </View>
      </View>
      <View style={styles.searchBarWrap}>
        <TextInput
          style={styles.searchBar}
          placeholder="Tìm sản phẩm..."
          placeholderTextColor="#B08968"
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.productId.toString()}
        renderItem={({ item }) => <ProductCard product={item} />}
        contentContainerStyle={{ paddingTop: 4, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  searchBarWrap: {
    paddingHorizontal: 0,
    marginTop: 8,
    marginBottom: 12,
  },
  searchBar: {
    backgroundColor: '#f8f4f0',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 44,
    fontSize: 16,
    color: '#4E342E',
    borderWidth: 1,
    borderColor: '#f3e7db',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 0,
    paddingHorizontal: 0,
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 36 : 36,
  },
  backButton: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: '#8D5B3F',
    borderRadius: 18,
    shadowColor: '#8D5B3F',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -36, // Compensate for back button width to center title
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#8D5B3F',
    marginVertical: 10,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  menuButton: {
    backgroundColor: '#8D5B3F',
    color: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
    fontSize: 18,
    fontWeight: 'bold',
    overflow: 'hidden',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#8D5B3F',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  // ...existing code...
});

export default MenuScreen;
