import React, { useEffect, useState } from 'react';
import { FairyLuxIcon } from '../components/FairyLuxIcon';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { FairyLuxImage } from '../components/FairyLuxImage';
import { fetchProduct, addToCart } from '../services/api';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export default function ProductDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const initialGown = route.params?.gown || null;
  const productId = route.params?.productId || initialGown?.id;

  const [product, setProduct] = useState(initialGown);
  const [loading, setLoading] = useState(!initialGown?.variants);
  const [errorMessage, setErrorMessage] = useState(null);

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeImage, setActiveImage] = useState(initialGown?.main_image || initialGown?.image || null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToast, setAddedToast] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProductDetails() {
      if (!productId) return;
      try {
        setLoading(true);
        setErrorMessage(null);
        const data = await fetchProduct(productId);
        if (isMounted && data) {
          setProduct(data);
          if (data.main_image) {
            setActiveImage(data.main_image);
          } else if (data.gallery_images && data.gallery_images.length > 0) {
            setActiveImage(data.gallery_images[0]);
          }

          if (data.available_colors && data.available_colors.length > 0) {
            setSelectedColor(data.available_colors[0]);
          }
          if (data.available_sizes && data.available_sizes.length > 0) {
            setSelectedSize(data.available_sizes[0]);
          }
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage(err.message || 'Unable to fetch product details.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProductDetails();
    return () => {
      isMounted = false;
    };
  }, [productId]);

  if (loading && !product) {
    return (
      <View style={styles.container}>
        <Header title="FairyLux" subtitle="LUXURY GOWN BOUTIQUE" onBack={() => navigation.goBack()} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.loadingText}>Loading gown details...</Text>
        </View>
      </View>
    );
  }

  if (errorMessage && !product) {
    return (
      <View style={styles.container}>
        <Header title="FairyLux" subtitle="LUXURY GOWN BOUTIQUE" onBack={() => navigation.goBack()} />
        <View style={styles.centerContainer}>
          <FairyLuxIcon name="warning" size={40} color={colors.gold} style={{ marginBottom: 12 }} />
          <Text style={styles.errorTitle}>Gown Unavailable</Text>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}>
            <Text style={styles.backButtonText}>Return to Shop</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Current display data
  const name = product?.name || 'Luxury Gown';
  const categoryName = product?.category?.name || product?.categoryName || 'Luxury Collection';
  const material = product?.material || null;
  const occasion = product?.occasion || null;
  const description = product?.description || product?.short_description || 'Beautifully designed and crafted by FairyLux.';
  const shortDescription = product?.short_description || null;

  // Variants & Options
  const variants = product?.variants || [];
  const hasVariants = variants.length > 0;
  const availableColors = product?.available_colors || [];
  const availableSizes = product?.available_sizes || [];

  // Match selected variant
  const activeVariant = hasVariants
    ? variants.find(
        (v) =>
          (!selectedColor || v.color?.id === selectedColor?.id || v.color?.name === selectedColor?.name) &&
          (!selectedSize || v.size?.id === selectedSize?.id || v.size?.code === selectedSize?.code)
      ) || null
    : null;

  // Pricing
  const basePrice = Number(activeVariant?.price ?? product?.base_price ?? product?.price ?? 0);
  const salePrice =
    product?.sale_price !== null && product?.sale_price !== undefined
      ? Number(product.sale_price)
      : null;
  const hasSale = salePrice !== null && salePrice > 0 && salePrice < basePrice;
  const currentPrice = hasSale ? salePrice : basePrice;
  const formattedPrice = `₱${currentPrice.toLocaleString()}`;

  // Stock status
  const currentVariantStock = activeVariant ? Number(activeVariant.stock_quantity ?? 0) : 0;
  const isAvailable = hasVariants && Boolean(activeVariant) && currentVariantStock > 0;

  // Gallery list (main image + gallery images)
  const allImages = [];
  if (product?.main_image) {
    allImages.push(product.main_image);
  }
  if (Array.isArray(product?.gallery_images)) {
    product.gallery_images.forEach((img) => {
      if (img && !allImages.includes(img)) {
        allImages.push(img);
      }
    });
  }

  const handleSelectColor = (col) => {
    setSelectedColor(col);
    if (col.image_url) {
      setActiveImage(col.image_url);
    }
  };

  const handleAddToCart = async () => {
    if (!hasVariants) {
      Alert.alert('Unavailable', 'This gown has no configured options.');
      return;
    }
    if (!selectedColor) {
      Alert.alert('Color Selection Required', 'Please select a color for this gown.');
      return;
    }
    if (!selectedSize) {
      Alert.alert('Size Selection Required', 'Please select a size for this gown.');
      return;
    }
    if (!activeVariant) {
      Alert.alert('Variant Unavailable', 'This color and size combination is not currently available.');
      return;
    }
    if (activeVariant.stock_quantity <= 0) {
      Alert.alert('Out of Stock', 'The selected option is currently out of stock.');
      return;
    }

    try {
      setAddingToCart(true);
      await addToCart(activeVariant.id, 1);
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 2800);
    } catch (err) {
      Alert.alert('Shopping Bag', err.message || 'Could not add item to bag.');
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="FairyLux"
        subtitle="LUXURY GOWN BOUTIQUE"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Large Product Image */}
        <View style={styles.imageContainer}>
          <FairyLuxImage
            source={{ uri: activeImage }}
            style={styles.heroImage}
            resizeMode="cover"
            placeholderText={categoryName}
          />

          {/* Floating Wishlist Button */}
          <TouchableOpacity
            style={styles.wishlistFloating}
            onPress={() => setIsWishlisted(!isWishlisted)}
            activeOpacity={0.85}>
            <FairyLuxIcon
              name={isWishlisted ? 'heart' : 'heart-outline'}
              size={20}
              color={isWishlisted ? '#e11d48' : colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Gallery Thumbnails */}
        {allImages.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.galleryStrip}>
            {allImages.map((imgUri, idx) => {
              const isSelected = activeImage === imgUri;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.galleryThumb, isSelected && styles.galleryThumbActive]}
                  onPress={() => setActiveImage(imgUri)}
                  activeOpacity={0.8}>
                  <FairyLuxImage
                    source={{ uri: imgUri }}
                    style={styles.thumbImage}
                    resizeMode="cover"
                    placeholderText="Photo"
                    showEmblem={false}
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Details Card */}
        <View style={styles.detailsCard}>
          {/* Category & Featured Badge */}
          <View style={styles.topRow}>
            <Text style={styles.categoryBadge}>{categoryName.toUpperCase()}</Text>
            {product?.is_featured ? (
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredBadgeText}>FEATURED GOWN</Text>
              </View>
            ) : null}
          </View>

          {/* Gown Title & Price */}
          <Text style={styles.gownTitle}>{name}</Text>

          {/* Price Display */}
          <View style={styles.priceRow}>
            {hasSale ? (
              <View style={styles.salePriceWrapper}>
                <Text style={styles.gownPrice}>{formattedPrice}</Text>
                <Text style={styles.originalPrice}>₱{basePrice.toLocaleString()}</Text>
              </View>
            ) : (
              <Text style={styles.gownPrice}>{formattedPrice}</Text>
            )}
          </View>

          {/* Stock / Availability Indicator */}
          <View style={styles.stockRow}>
            <View
              style={[
                styles.stockDot,
                isAvailable ? styles.stockDotInStock : styles.stockDotOutOfStock,
              ]}
            />
            <Text style={styles.stockText}>
              {!hasVariants
                ? 'Unavailable • No variants configured'
                : isAvailable
                ? activeVariant
                  ? `${activeVariant.stock_quantity} available in stock`
                  : 'In Stock'
                : 'Currently Out of Stock'}
            </Text>
          </View>

          {/* Active Variant SKU Display */}
          {activeVariant?.sku ? (
            <View style={styles.skuRow}>
              <Text style={styles.skuLabel}>SKU: </Text>
              <Text style={styles.skuValue}>{activeVariant.sku}</Text>
            </View>
          ) : null}

          <View style={styles.divider} />

          {/* Color Selection (if variants exist) */}
          {availableColors.length > 0 && (
            <View style={styles.optionSection}>
              <Text style={styles.optionTitle}>
                Selected Color:{' '}
                <Text style={styles.optionSelected}>{selectedColor?.name || 'Choose Color'}</Text>
              </Text>
              <View style={styles.colorRow}>
                {availableColors.map((col) => {
                  const isSelected = selectedColor?.id === col.id || selectedColor?.name === col.name;
                  return (
                    <TouchableOpacity
                      key={col.id || col.name}
                      style={[styles.colorPill, isSelected && styles.colorPillSelected]}
                      onPress={() => handleSelectColor(col)}
                      activeOpacity={0.8}>
                      {col.hex_code ? (
                        <View style={[styles.colorDot, { backgroundColor: col.hex_code }]} />
                      ) : null}
                      <Text style={[styles.colorText, isSelected && styles.colorTextSelected]}>
                        {col.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Size Selection (if variants exist) */}
          {availableSizes.length > 0 && (
            <View style={styles.optionSection}>
              <View style={styles.sizeTitleRow}>
                <Text style={styles.optionTitle}>
                  Select Size:{' '}
                  <Text style={styles.optionSelected}>
                    {selectedSize?.name || selectedSize?.code || 'Choose Size'}
                  </Text>
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert(
                      'FairyLux Sizing Guide',
                      'Our gowns adhere to standard luxury sizing. For tailored measurements, please contact customer support.'
                    )
                  }>
                  <Text style={styles.sizeGuideLink}>Size Guide</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.sizeGrid}>
                {availableSizes.map((sz) => {
                  const isSelected = selectedSize?.id === sz.id || selectedSize?.code === sz.code;
                  return (
                    <TouchableOpacity
                      key={sz.id || sz.code}
                      style={[styles.sizeBox, isSelected && styles.sizeBoxSelected]}
                      onPress={() => setSelectedSize(sz)}
                      activeOpacity={0.8}>
                      <Text style={[styles.sizeText, isSelected && styles.sizeTextSelected]}>
                        {sz.code || sz.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Zero-variants notice */}
          {!hasVariants && (
            <View style={styles.noticeBox}>
              <FairyLuxIcon name="info" size={16} color={colors.gold} style={{ marginRight: 8 }} />
              <Text style={styles.noticeText}>
                This gown currently has no size or color options configured in the catalog.
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          {/* Gown Description */}
          <View style={styles.descSection}>
            <Text style={styles.descTitle}>Craftsmanship & Details</Text>
            {shortDescription ? (
              <Text style={styles.shortDescText}>{shortDescription}</Text>
            ) : null}
            <Text style={styles.descText}>{description}</Text>
          </View>

          {/* Fabric & Occasion Details */}
          {(material || occasion) && (
            <View style={styles.specSection}>
              {material ? (
                <View style={styles.specItem}>
                  <Text style={styles.specLabel}>Material & Fabric</Text>
                  <Text style={styles.specValue}>{material}</Text>
                </View>
              ) : null}
              {occasion ? (
                <View style={styles.specItem}>
                  <Text style={styles.specLabel}>Recommended Occasion</Text>
                  <Text style={styles.specValue}>{occasion}</Text>
                </View>
              ) : null}
            </View>
          )}

          {/* Atelier Highlights */}
          <View style={styles.featuresBox}>
            <View style={styles.featureItem}>
              <FairyLuxIcon name="scissors" size={18} color={colors.gold} style={styles.featureIconView} />
              <Text style={styles.featureText}>Custom Hand-Tailoring</Text>
            </View>
            <View style={styles.featureItem}>
              <FairyLuxIcon name="sparkle" size={18} color={colors.gold} style={styles.featureIconView} />
              <Text style={styles.featureText}>Premium Quality Fabric & Lace</Text>
            </View>
            <View style={styles.featureItem}>
              <FairyLuxIcon name="package" size={18} color={colors.gold} style={styles.featureIconView} />
              <Text style={styles.featureText}>Careful Luxury Box Packaging</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Added to Bag Toast Feedback */}
      {addedToast ? (
        <View style={styles.toast}>
          <FairyLuxIcon name="check" size={14} color="#ffffff" style={{ marginRight: 8 }} />
          <Text style={styles.toastText}>
            Added {name} to your bag!
          </Text>
        </View>
      ) : null}

      {/* Bottom Sticky Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 10 }]}>
        <TouchableOpacity
          style={[styles.cartCTAButton, (!isAvailable || addingToCart) && styles.cartCTAButtonDisabled]}
          onPress={handleAddToCart}
          disabled={!isAvailable || addingToCart}
          activeOpacity={0.88}>
          {addingToCart ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.cartCTAText}>
              {!hasVariants
                ? 'Currently Unavailable'
                : !activeVariant
                ? 'Select Color & Size'
                : activeVariant.stock_quantity <= 0
                ? 'Out of Stock'
                : `Add to Bag • ${formattedPrice}`}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 13,
    color: colors.gold,
    fontWeight: '600',
    marginTop: 14,
  },
  errorIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 6,
  },
  errorText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 19,
  },
  backButton: {
    backgroundColor: colors.gold,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  imageContainer: {
    width: '100%',
    height: 380,
    backgroundColor: colors.surfaceAlt,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  wishlistFloating: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  wishlistIcon: {
    fontSize: 20,
  },
  galleryStrip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    backgroundColor: colors.surface,
  },
  galleryThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: 8,
  },
  galleryThumbActive: {
    borderColor: colors.gold,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  detailsCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 24,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    fontFamily: fonts.bold,
    fontSize: 11,
    fontWeight: '800',
    color: colors.brand,
    letterSpacing: 1.2,
  },
  featuredBadge: {
    backgroundColor: colors.brandLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.brandBorder,
  },
  featuredBadgeText: {
    fontFamily: fonts.bold,
    color: colors.brand,
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  gownTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 26,
    marginBottom: 6,
  },
  priceRow: {
    marginBottom: 10,
  },
  salePriceWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  gownPrice: {
    fontFamily: fonts.bold,
    fontSize: 22,
    fontWeight: '800',
    color: colors.brand,
  },
  originalPrice: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  stockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  stockDotInStock: {
    backgroundColor: colors.success,
  },
  stockDotOutOfStock: {
    backgroundColor: colors.danger,
  },
  stockText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  skuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  skuLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  skuValue: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: colors.textPrimary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 14,
  },
  optionSection: {
    marginBottom: 14,
  },
  optionTitle: {
    fontFamily: fonts.bold,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  optionSelected: {
    color: colors.brand,
    fontWeight: '800',
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 6,
    marginBottom: 6,
  },
  colorPillSelected: {
    borderColor: colors.brand,
    backgroundColor: colors.brandLight,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  colorText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  colorTextSelected: {
    color: colors.brand,
    fontWeight: '700',
  },
  sizeTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sizeGuideLink: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: '600',
    color: colors.brand,
  },
  sizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sizeBox: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    marginRight: 6,
    marginBottom: 6,
    minWidth: 46,
    alignItems: 'center',
  },
  sizeBoxSelected: {
    borderColor: colors.brand,
    backgroundColor: colors.brandLight,
  },
  sizeText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sizeTextSelected: {
    color: colors.brand,
    fontWeight: '700',
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    padding: 12,
    borderRadius: 12,
    marginVertical: 10,
  },
  noticeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  noticeText: {
    fontFamily: fonts.regular,
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  descSection: {
    marginBottom: 14,
  },
  descTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  shortDescText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    fontWeight: '500',
    color: colors.brand,
    lineHeight: 18,
    marginBottom: 6,
  },
  descText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  specSection: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  specItem: {
    flexDirection: 'column',
  },
  specLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  specValue: {
    fontFamily: fonts.medium,
    fontSize: 13,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  featuresBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 14,
    marginRight: 10,
  },
  featureText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  toast: {
    position: 'absolute',
    bottom: 85,
    left: 20,
    right: 20,
    backgroundColor: colors.brandDark,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.brandDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  toastText: {
    fontFamily: fonts.medium,
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  cartCTAButton: {
    backgroundColor: colors.brand,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.brandDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  cartCTAButtonDisabled: {
    backgroundColor: colors.textMuted,
    opacity: 0.5,
  },
  cartCTAText: {
    fontFamily: fonts.bold,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
