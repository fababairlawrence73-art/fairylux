import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { Header } from '../components/Header';
import { FairyLuxIcon } from '../components/FairyLuxIcon';
import { mockGowns } from '../data/mockGowns';

export function WishlistScreen({ navigation }) {
  const [wishlistItems, setWishlistItems] = useState(
    mockGowns.filter((g) => g.isWishlisted || g.isFeatured)
  );

  const removeFromWishlist = (id) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== id));
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('ProductDetails', { gown: item })}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        <View style={styles.topRow}>
          <Text style={styles.category}>{item.category}</Text>
          <TouchableOpacity
            onPress={() => removeFromWishlist(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <FairyLuxIcon name="heart" size={16} color={colors.gold} />
          </TouchableOpacity>
        </View>

        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.fabric}>{item.fabric}</Text>
        <Text style={styles.price}>₱{item.price.toLocaleString()}</Text>

        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => navigation.navigate('ProductDetails', { gown: item })}
        >
          <Text style={styles.bookBtnText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="My Wishlist" navigation={navigation} />

      {wishlistItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FairyLuxIcon name="heart-outline" size={50} color={colors.gold} style={{ marginBottom: 12, opacity: 0.5 }} />
          <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Save your favorite bridal and evening gowns while exploring the boutique.
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigation.navigate('Shop')}
          >
            <Text style={styles.exploreBtnText}>Discover Gowns</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={wishlistItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    width: 95,
    height: 125,
    borderRadius: 10,
    backgroundColor: colors.border,
  },
  cardContent: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: colors.brand,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heartIcon: {
    fontSize: 18,
    color: colors.gold,
  },
  name: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  fabric: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    marginTop: 2,
  },
  price: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.gold,
    marginTop: 4,
  },
  bookBtn: {
    backgroundColor: colors.brand,
    borderRadius: 10,
    paddingVertical: 7,
    alignItems: 'center',
    marginTop: 8,
  },
  bookBtnText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: '#ffffff',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 60,
    color: colors.textMuted,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 19,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  exploreBtn: {
    backgroundColor: colors.brand,
    paddingVertical: 13,
    paddingHorizontal: 26,
    borderRadius: 14,
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 3,
  },
  exploreBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: fonts.semiBold,
    letterSpacing: 0.3,
  },
});
