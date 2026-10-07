import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { FairyLuxImage } from './FairyLuxImage';
import { FairyLuxIcon } from './FairyLuxIcon';

export function GownCard({ gown, style, showWishlist = false }) {
  const navigation = useNavigation();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handlePress = () => {
    navigation.navigate('ProductDetails', {
      productId: gown.id,
      gown,
    });
  };

  const categoryName = gown.category?.name || gown.categoryName || 'Luxury Gown';
  const imageUrl = gown.main_image || gown.image || null;

  const basePrice = Number(gown.base_price ?? gown.price ?? 0);
  const salePrice = gown.sale_price !== null && gown.sale_price !== undefined ? Number(gown.sale_price) : null;
  const hasSale = salePrice !== null && salePrice > 0 && salePrice < basePrice;

  const isFeatured = Boolean(gown.is_featured ?? gown.isFeatured);
  const isOutOfStock = gown.in_stock === false || gown.total_stock === 0;

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={handlePress}
      activeOpacity={0.88}>
      <View style={styles.imageWrapper}>
        <FairyLuxImage
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
          placeholderText={categoryName}
        />

        {/* Badges */}
        <View style={styles.badgeContainer}>
          {isOutOfStock ? (
            <View style={[styles.badge, styles.outOfStockBadge]}>
              <Text style={styles.outOfStockBadgeText}>OUT OF STOCK</Text>
            </View>
          ) : isFeatured ? (
            <View style={[styles.badge, styles.featuredBadge]}>
              <Text style={styles.featuredBadgeText}>FEATURED</Text>
            </View>
          ) : gown.isNew ? (
            <View style={[styles.badge, styles.newBadge]}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          ) : null}
        </View>

        {/* Wishlist Button */}
        {showWishlist && (
          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={() => setIsWishlisted(!isWishlisted)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <FairyLuxIcon
              name={isWishlisted ? 'heart' : 'heart-outline'}
              size={15}
              color={isWishlisted ? colors.brand : colors.textPrimary}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.categoryText} numberOfLines={1}>
          {categoryName.toUpperCase()}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {gown.name}
        </Text>

        <View style={styles.footerRow}>
          <View style={styles.priceContainer}>
            {hasSale ? (
              <View style={styles.salePriceRow}>
                <Text style={styles.salePrice}>₱{salePrice.toLocaleString()}</Text>
                <Text style={styles.originalPrice}>₱{basePrice.toLocaleString()}</Text>
              </View>
            ) : (
              <Text style={styles.price}>₱{basePrice.toLocaleString()}</Text>
            )}
          </View>

          {gown.rating !== undefined && (
            <View style={styles.ratingBox}>
              <FairyLuxIcon name="star" size={10} color={colors.gold} style={{ marginRight: 3 }} />
              <Text style={styles.ratingText}>{Number(gown.rating).toFixed(1)}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.brandDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  imageWrapper: {
    width: '100%',
    height: 200,
    backgroundColor: colors.surfaceAlt,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'column',
    gap: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  featuredBadge: {
    backgroundColor: colors.brandDark,
  },
  featuredBadgeText: {
    fontFamily: fonts.bold,
    color: '#ffffff',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  newBadge: {
    backgroundColor: colors.brand,
  },
  newBadgeText: {
    fontFamily: fonts.bold,
    color: '#ffffff',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  outOfStockBadge: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  outOfStockBadgeText: {
    fontFamily: fonts.bold,
    color: '#dc2626',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  wishlistButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.brandDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    padding: 12,
  },
  categoryText: {
    fontFamily: fonts.semiBold,
    fontSize: 9.5,
    fontWeight: '600',
    color: colors.brand,
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  title: {
    fontFamily: fonts.medium,
    fontSize: 13,
    fontWeight: '500',
    color: colors.textPrimary,
    lineHeight: 18,
    marginBottom: 8,
    minHeight: 36,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    fontFamily: fonts.bold,
    fontSize: 14,
    fontWeight: '700',
    color: colors.brand,
  },
  salePriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    flexWrap: 'wrap',
  },
  salePrice: {
    fontFamily: fonts.bold,
    fontSize: 14,
    fontWeight: '700',
    color: colors.brand,
  },
  originalPrice: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.goldLight,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  ratingText: {
    fontFamily: fonts.bold,
    color: colors.gold,
    fontSize: 10.5,
    fontWeight: '700',
  },
});

export default GownCard;
