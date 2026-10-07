import React, { useState, useCallback } from 'react';
import { FairyLuxIcon } from '../components/FairyLuxIcon';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { Header } from '../components/Header';
import { FairyLuxImage } from '../components/FairyLuxImage';
import {
  fetchCart,
  updateCartQuantity,
  removeFromCart,
  fetchAddresses,
} from '../services/api';

export function CartScreen({ navigation }) {
  const [cartData, setCartData] = useState({
    items: [],
    items_count: 0,
    subtotal: 0,
    shipping_fee: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  // Address gate modal state
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [checkingCheckout, setCheckingCheckout] = useState(false);

  const loadCart = useCallback(async (isPullRefresh = false) => {
    try {
      if (isPullRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const data = await fetchCart();
      setCartData(data);
    } catch (err) {
      console.warn('Could not load cart:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [loadCart])
  );

  const handleUpdateQuantity = async (item, delta) => {
    const newQty = item.quantity + delta;

    if (newQty < 1) {
      handleRemoveItem(item);
      return;
    }

    if (newQty > item.available_stock) {
      Alert.alert(
        'Inventory Limit',
        `Only ${item.available_stock} unit${item.available_stock > 1 ? 's' : ''} available in stock for this gown variant.`
      );
      return;
    }

    try {
      setUpdatingId(item.id);
      await updateCartQuantity(item.id, newQty);
      await loadCart();
    } catch (err) {
      Alert.alert('Update Failed', err.message || 'Could not update quantity.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveItem = (item) => {
    Alert.alert(
      'Remove Gown',
      `Remove "${item.product_name}" from your shopping bag?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setUpdatingId(item.id);
              await removeFromCart(item.id);
              await loadCart();
            } catch (err) {
              Alert.alert('Remove Failed', err.message || 'Could not remove item.');
            } finally {
              setUpdatingId(null);
            }
          },
        },
      ]
    );
  };

  const handleProceedToCheckout = async () => {
    if (cartData.items.length === 0) {
      Alert.alert('Bag Empty', 'Your shopping bag is empty.');
      return;
    }

    // Check if any items are out of stock
    const outOfStockItem = cartData.items.find((i) => !i.is_in_stock || i.quantity > i.available_stock);
    if (outOfStockItem) {
      Alert.alert(
        'Stock Unavailable',
        `"${outOfStockItem.product_name}" has only ${outOfStockItem.available_stock} available units. Please adjust your bag quantity.`
      );
      return;
    }

    try {
      setCheckingCheckout(true);
      const addresses = await fetchAddresses();

      if (!addresses || addresses.length === 0) {
        // REQUIREMENT 5: Block checkout when no address exists
        setAddressModalVisible(true);
      } else {
        // Find default or first address
        const selectedAddress = addresses.find((a) => a.is_default) || addresses[0];
        navigation.navigate('Checkout', {
          cartData,
          selectedAddress,
        });
      }
    } catch (err) {
      Alert.alert('Checkout Verification', err.message || 'Could not verify delivery address.');
    } finally {
      setCheckingCheckout(false);
    }
  };

  const renderCartItem = ({ item }) => {
    const isBusy = updatingId === item.id;
    const colorText = item.color?.name || 'Standard';
    const sizeText = item.size?.name || item.size?.code || 'Standard';

    return (
      <View style={styles.card}>
        <FairyLuxImage
          source={{ uri: item.image_url }}
          style={styles.image}
          resizeMode="cover"
          placeholderText="Gown"
        />

        <View style={styles.itemInfo}>
          {/* Header Row */}
          <View style={styles.itemHeader}>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.product_name}
            </Text>
            <TouchableOpacity
              onPress={() => handleRemoveItem(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              disabled={isBusy}
            >
              <FairyLuxIcon name="close" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Variant Spec Badges */}
          <View style={styles.specsRow}>
            <View style={styles.specBadge}>
              <Text style={styles.specLabel}>Color: </Text>
              <Text style={styles.specValue}>{colorText}</Text>
            </View>
            <View style={styles.specBadge}>
              <Text style={styles.specLabel}>Size: </Text>
              <Text style={styles.specValue}>{sizeText}</Text>
            </View>
          </View>

          {/* Stock Notice if Low */}
          {item.available_stock > 0 && item.available_stock <= 3 && (
            <Text style={styles.lowStockText}>
              Only {item.available_stock} left in stock
            </Text>
          )}

          {!item.is_in_stock && (
            <View style={styles.outOfStockRow}>
              <FairyLuxIcon name="warning" size={13} color="#ef4444" style={{ marginRight: 4 }} />
              <Text style={styles.outOfStockText}>Currently Out of Stock</Text>
            </View>
          )}

          {/* Pricing & Quantity Row */}
          <View style={styles.bottomRow}>
            <View>
              <Text style={styles.itemPrice}>
                ₱{item.unit_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
              <Text style={styles.lineSubtotalText}>
                Subtotal: ₱{item.line_total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </View>

            <View style={styles.qtyControl}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => handleUpdateQuantity(item, -1)}
                disabled={isBusy}
              >
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>

              {isBusy ? (
                <View style={styles.qtySpinnerBox}>
                  <ActivityIndicator size="small" color={colors.gold} />
                </View>
              ) : (
                <Text style={styles.qtyText}>{item.quantity}</Text>
              )}

              <TouchableOpacity
                style={[
                  styles.qtyBtn,
                  item.quantity >= item.available_stock && styles.qtyBtnDisabled,
                ]}
                onPress={() => handleUpdateQuantity(item, 1)}
                disabled={isBusy || item.quantity >= item.available_stock}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="Shopping Bag" navigation={navigation} />

      {loading && cartData.items.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.loadingText}>Loading your shopping bag...</Text>
        </View>
      ) : cartData.items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FairyLuxIcon name="bag" size={60} color={colors.gold} style={{ marginBottom: 14, opacity: 0.45 }} />
          <Text style={styles.emptyTitle}>Your Bag is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Explore our collection of beautiful bridal and evening gowns.
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigation.navigate('Shop')}
            activeOpacity={0.85}
          >
            <Text style={styles.exploreBtnText}>Explore Collection</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartData.items}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderCartItem}
            refreshing={refreshing}
            onRefresh={() => loadCart(true)}
            contentContainerStyle={styles.listContent}
            ListFooterComponent={
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Order Summary</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    Subtotal ({cartData.total_quantity} item{cartData.total_quantity > 1 ? 's' : ''})
                  </Text>
                  <Text style={styles.summaryValue}>
                    ₱{cartData.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Delivery & White-Glove Handling</Text>
                  <Text style={styles.summaryValueComplimentary}>COMPLIMENTARY</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>
                    ₱{cartData.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              </View>
            }
          />

          {/* Sticky Checkout Bottom Bar */}
          <View style={styles.footer}>
            <View style={styles.footerPriceCol}>
              <Text style={styles.footerLabel}>Total Amount</Text>
              <Text style={styles.footerAmount}>
                ₱{cartData.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.checkoutBtn, checkingCheckout && styles.checkoutBtnDisabled]}
              onPress={handleProceedToCheckout}
              disabled={checkingCheckout}
              activeOpacity={0.88}
            >
              {checkingCheckout ? (
                <ActivityIndicator size="small" color={colors.primaryDark} />
              ) : (
                <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* REQUIREMENT 5: Delivery Address Required Modal */}
      <Modal
        visible={addressModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAddressModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.addressAlertCard}>
            <View style={styles.addressAlertIcon}>
              <FairyLuxIcon name="pin" size={28} color={colors.gold} />
            </View>
            <Text style={styles.addressAlertTitle}>Delivery Address Required</Text>
            <Text style={styles.addressAlertMessage}>
              Please set up a delivery address before proceeding to checkout.
            </Text>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setAddressModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSetAddressBtn}
                onPress={() => {
                  setAddressModalVisible(false);
                  navigation.navigate('My Addresses', {
                    autoOpenAdd: true,
                    fromCheckout: true,
                    returnToCheckout: true,
                    cartData,
                  });
                }}
                activeOpacity={0.88}
              >
                <Text style={styles.modalSetAddressText}>Set Address</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.gold,
    fontSize: 13,
    marginTop: 12,
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    width: 90,
    height: 120,
    borderRadius: 12,
    backgroundColor: colors.surfaceLight,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
    paddingRight: 8,
  },
  removeText: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '600',
  },
  specsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
    flexWrap: 'wrap',
  },
  specBadge: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  specLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  specValue: {
    fontSize: 11,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  lowStockText: {
    fontSize: 11,
    color: '#f59e0b',
    fontWeight: '600',
  },
  outOfStockRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  outOfStockText: {
    fontSize: 11,
    color: '#ef4444',
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 6,
  },
  itemPrice: {
    fontFamily: fonts.bold,
    fontSize: 15,
    fontWeight: '700',
    color: colors.brand,
  },
  lineSubtotalText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  qtyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  qtyBtnDisabled: {
    opacity: 0.3,
  },
  qtyBtnText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  qtyText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    minWidth: 22,
    textAlign: 'center',
  },
  qtySpinnerBox: {
    minWidth: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 12,
  },
  summaryTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  summaryValue: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  summaryValueComplimentary: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: '#10b981',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  totalLabel: {
    fontFamily: fonts.bold,
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  totalValue: {
    fontFamily: fonts.bold,
    fontSize: 18,
    fontWeight: '800',
    color: colors.brand,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  footerPriceCol: {
    flex: 1,
  },
  footerLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  footerAmount: {
    fontFamily: fonts.bold,
    fontSize: 18,
    fontWeight: '800',
    color: colors.brand,
  },
  checkoutBtn: {
    backgroundColor: colors.brand,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    shadowColor: colors.brandDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 4,
  },
  checkoutBtnDisabled: {
    opacity: 0.6,
  },
  checkoutBtnText: {
    fontFamily: fonts.bold,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  exploreBtn: {
    backgroundColor: colors.brand,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    shadowColor: colors.brandDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  exploreBtnText: {
    fontFamily: fonts.bold,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  // Address Requirement Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  addressAlertCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  addressAlertIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  addressAlertTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  addressAlertMessage: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  modalSetAddressBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: colors.gold,
    alignItems: 'center',
  },
  modalSetAddressText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
});
