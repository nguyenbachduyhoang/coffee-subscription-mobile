
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Product } from '../screens/Menu/MenuScreen';

const ProductCard = ({ product }: { product: Product }) => (
  <View style={styles.menuCard}>
    <Image source={{ uri: product.imageUrl }} style={styles.menuImage} resizeMode="contain" />
    <View style={styles.menuInfo}>
      <Text style={styles.menuName}>{product.name}</Text>
      <Text style={styles.menuCategory}>{product.category}</Text>
      <Text style={styles.menuDescription} numberOfLines={2}>{product.description}</Text>
      <Text style={styles.menuPrice}>{product.price.toLocaleString()} đ</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3e7db',
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: '#8D5B3F',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  menuImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#f8f4f0',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#f3e7db',
  },
  menuInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  menuName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4E342E',
    marginBottom: 2,
  },
  menuCategory: {
    fontSize: 13,
    color: '#8D5B3F',
    marginBottom: 2,
    fontWeight: '500',
  },
  menuDescription: {
    fontSize: 13,
    color: '#6d4c41',
    marginBottom: 8,
    lineHeight: 18,
  },
  menuPrice: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#C47A3A',
    marginTop: 2,
    letterSpacing: 0.3,
  },
});

export default ProductCard;
