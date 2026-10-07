import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { FairyLuxImage } from '../components/FairyLuxImage';
import { FairyLuxIcon } from '../components/FairyLuxIcon';
import {
  fetchCart,
  fetchAddresses,
  placeOrder,
} from '../services/api';

export function CheckoutScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();

  const [cart, setCart] = useState(route.params?.cartData || null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(route.params?.selectedAddress || null);
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [addressPickerVisible, setAddressPickerVisible] = useState(false);

  // Success Confirmation Modal
  const [successOrder, setSuccessOrder] = useState(null);

  useEffect(() => {
    if (route.params?.selectedAddress) {
      setSelectedAddress(route.params.selectedAddress);
    }
  }, [route.params?.selectedAddress]);

  useEffect(() => {
    if (route.params?.cartData) {
      setCart(route.params.cartData);
    }
  }, [route.params?.cartData]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [cartRes, addrRes] = await Promise.all([
        fetchCart(),
        fetchAddresses(),
      ]);

      if (cartRes && cartRes.items) {
        setCart(cartRes);
      }
      setAddresses(addrRes || []);

      if (addrRes && addrRes.length > 0) {
        const paramAddr = route.params?.selectedAddress
          ? addrRes.find((a) => a.id === route.params.selectedAddress.id) || route.params.selectedAddress
          : null;
        if (paramAddr) {
          setSelectedAddress(paramAddr);
        } else if (!selectedAddress || !addrRes.find((a) => a.id === selectedAddress.id)) {
          const defaultAddr = addrRes.find((a) => a.is_default) || addrRes[0];
          setSelectedAddress(defaultAddr);
        }
      }
    } catch (err) {
      console.warn('Error loading checkout data:', err);
    } finally {
      setLoading(false);
    }
  }, [route.params?.selectedAddress, selectedAddress]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert(
        'Delivery Address Required',
        'Please select or add a delivery address before placing your order.'
      );
      return;
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      Alert.alert('Empty Bag', 'Your shopping bag has no items.');
      return;
    }

    try {
      setSubmitting(true);
      const result = await placeOrder({
        address_id: selectedAddress.id,
        notes: notes.trim() || undefined,
      });

      // Order created successfully!
      setSuccessOrder(result);
    } catch (err) {
      Alert.alert(
        'Order Placement Failed',
        err.message || 'We could not complete your order. Please review your bag and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDismissSuccess = () => {
    setSuccessOrder(null);
    // Reset to MainTabs with Orders active
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'DrawerRoot',
          state: {
            routes: [
              {
                name: 'MainTabs',
                state: {
                  routes: [{ name: 'Orders' }],
                  index: 3,
                },
              },
            ],
          },
        },
      ],
    });
  };

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const total = cart?.total || subtotal;

  const formattedAddress = selectedAddress
    ? [
        selectedAddress.apartment_suite,
        selectedAddress.street_address,
        selectedAddress.barangay,
        selectedAddress.city,
        selectedAddress.state_province,
        selectedAddress.postal_code,
        selectedAddress.country || 'Philippines',
      ]
        .filter(Boolean)
        .join(', ')
    : '';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <FairyLuxIcon name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading && !cart ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.loadingText}>Preparing checkout...</Text>
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
            showsVerticalScrollIndicator={false}
          >
            {/* Delivery Address Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>DELIVERY ADDRESS</Text>
                {addresses.length > 1 && (
                  <TouchableOpacity onPress={() => setAddressPickerVisible(true)}>
                    <Text style={styles.changeLink}>Change</Text>
                  </TouchableOpacity>
                )}
              </View>

              {selectedAddress ? (
                <View style={styles.addressCard}>
                  <View style={styles.addressTopRow}>
                    <Text style={styles.addressRecipient}>
                      {selectedAddress.recipient_name}
                    </Text>
                    {selectedAddress.is_default ? (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={styles.addressPhoneRow}>
                    <FairyLuxIcon name="phone" size={12} color={colors.textMuted} style={{ marginRight: 5 }} />
                    <Text style={styles.addressPhone}>{selectedAddress.phone_number}</Text>
                  </View>
                  <Text style={styles.addressBody}>{formattedAddress}</Text>
                  {selectedAddress.landmark ? (
                    <View style={styles.landmarkRow}>
                      <FairyLuxIcon name="pin" size={12} color={colors.textMuted} style={{ marginRight: 5 }} />
                      <Text style={styles.addressLandmark}>
                        {selectedAddress.landmark}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.noAddressCard}
                  onPress={() =>
                    navigation.navigate('My Addresses', {
                      autoOpenAdd: true,
                      fromCheckout: true,
                      cartData: cart,
                    })
                  }
                >
                  <Text style={styles.noAddressText}>+ Add Delivery Address</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Order Items Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                ORDER SUMMARY ({items.length} ITEM{items.length > 1 ? 'S' : ''})
              </Text>

              <View style={styles.itemsCard}>
                {items.map((item, idx) => (
                  <View
                    key={item.id}
                    style={[styles.itemRow, idx < items.length - 1 && styles.itemRowBorder]}
                  >
                    <FairyLuxImage
                      source={{ uri: item.image_url }}
                      style={styles.itemImage}
                      resizeMode="cover"
                      placeholderText="Gown"
                    />
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName} numberOfLines={1}>
                        {item.product_name}
                      </Text>
                      <View style={styles.variantBadgeRow}>
                        <Text style={styles.variantBadgeText}>
                          Color: {item.color?.name || 'Standard'}
                        </Text>
                        <Text style={styles.variantBadgeDot}>•</Text>
                        <Text style={styles.variantBadgeText}>
                          Size: {item.size?.name || item.size?.code || 'Standard'}
                        </Text>
                      </View>
                      <Text style={styles.itemQuantity}>
                        Qty: {item.quantity} × ₱{item.unit_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </Text>
                    </View>
                    <Text style={styles.itemLineTotal}>
                      ₱{item.line_total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Payment Method Notice */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>PAYMENT METHOD</Text>
              <View style={styles.paymentCard}>
                <View style={styles.paymentIconBox}>
                  <FairyLuxIcon name="check" size={18} color={colors.gold} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.paymentTitle}>Cash on Delivery</Text>
                  <Text style={styles.paymentSubtitle}>
                    Inspect your gown upon delivery before completing payment.
                  </Text>
                </View>
              </View>
            </View>

            {/* Delivery Notes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SPECIAL DELIVERY INSTRUCTIONS</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Gate codes, delivery time preference, delivery instructions (optional)..."
                placeholderTextColor="#64748b"
                value={notes}
                onChangeText={setNotes}
                multiline={true}
                numberOfLines={2}
              />
            </View>

            {/* Cost Breakdown */}
            <View style={styles.summaryBox}>
              <View style={styles.summaryLine}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>
                  ₱{subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </View>
              <View style={styles.summaryLine}>
                <Text style={styles.summaryLabel}>Delivery</Text>
                <Text style={styles.complimentaryText}>COMPLIMENTARY</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryLine}>
                <Text style={styles.finalTotalLabel}>Total Amount</Text>
                <Text style={styles.finalTotalValue}>
                  ₱{total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Sticky Bottom Place Order Bar */}
          <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 10 }]}>
            <View style={styles.bottomPriceCol}>
              <Text style={styles.bottomPriceLabel}>Total Amount</Text>
              <Text style={styles.bottomPriceValue}>
                ₱{total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.placeOrderBtn, submitting && styles.placeOrderBtnDisabled]}
              onPress={handlePlaceOrder}
              disabled={submitting}
              activeOpacity={0.88}
            >
              {submitting ? (
                <ActivityIndicator color={colors.primaryDark} />
              ) : (
                <Text style={styles.placeOrderBtnText}>Place Order</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Address Switcher Modal */}
      <Modal
        visible={addressPickerVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAddressPickerVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Delivery Address</Text>
              <TouchableOpacity onPress={() => setAddressPickerVisible(false)}>
                <FairyLuxIcon name="close" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
              {addresses.map((addr) => {
                const isSelected = selectedAddress?.id === addr.id;
                return (
                  <TouchableOpacity
                    key={addr.id}
                    style={[styles.pickerAddressCard, isSelected && styles.pickerAddressCardSelected]}
                    onPress={() => {
                      setSelectedAddress(addr);
                      setAddressPickerVisible(false);
                    }}
                  >
                    <View style={styles.addressTopRow}>
                      <Text style={styles.addressRecipient}>{addr.recipient_name}</Text>
                      {isSelected ? (
                        <View style={styles.selectedCheck}>
                          <FairyLuxIcon name="check" size={12} color={colors.gold} />
                          <Text style={styles.selectedCheckText}>SELECTED</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.addressPhone}>{addr.phone_number}</Text>
                    <Text style={styles.addressBody} numberOfLines={2}>
                      {[addr.street_address, addr.city, addr.state_province].filter(Boolean).join(', ')}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                style={styles.addAddressModalBtn}
                onPress={() => {
                  setAddressPickerVisible(false);
                  navigation.navigate('My Addresses', {
                    autoOpenAdd: true,
                    fromCheckout: true,
                    cartData: cart,
                  });
                }}
              >
                <Text style={styles.addAddressModalText}>+ Add Another Address</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Order Success Confirmation Modal */}
      <Modal
        visible={Boolean(successOrder)}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.successBackdrop}>
          <View style={styles.successCard}>
            <View style={styles.successIconBox}>
              <FairyLuxIcon name="sparkle" size={32} color={colors.gold} />
            </View>
            <Text style={styles.successTitle}>Order Placed Successfully</Text>
            <Text style={styles.successOrderNumber}>
              Order #{successOrder?.order_number}
            </Text>
            <Text style={styles.successMessage}>
              Thank you for choosing FairyLux. Your gown order has been placed successfully.
              Our team will prepare and process your delivery promptly.
            </Text>

            <View style={styles.successTotalRow}>
              <Text style={styles.successTotalLabel}>Amount Due:</Text>
              <Text style={styles.successTotalValue}>
                ₱{(successOrder?.total_amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.successBtn}
              onPress={handleDismissSuccess}
              activeOpacity={0.88}
            >
              <Text style={styles.successBtnText}>View My Orders</Text>
            </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: colors.gold,
    fontWeight: '700',
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: fonts.medium,
    color: colors.brand,
    fontSize: 13,
    marginTop: 12,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
  },
  changeLink: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: '600',
    color: colors.brand,
  },
  addressCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addressTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  addressRecipient: {
    fontFamily: fonts.bold,
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  defaultBadge: {
    backgroundColor: colors.brandLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.brandBorder,
  },
  defaultBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    fontWeight: '800',
    color: colors.brand,
    letterSpacing: 0.5,
  },
  addressPhone: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  addressBody: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  addressLandmark: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.brand,
    fontStyle: 'italic',
    marginTop: 4,
  },
  noAddressCard: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.brand,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  noAddressText: {
    fontFamily: fonts.bold,
    color: colors.brand,
    fontSize: 13,
    fontWeight: '700',
  },
  itemsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  itemRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemImage: {
    width: 60,
    height: 75,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  itemName: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  variantBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginVertical: 2,
  },
  variantBadgeText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
  variantBadgeDot: {
    color: colors.textMuted,
    fontSize: 10,
  },
  itemQuantity: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.brand,
    fontWeight: '500',
    marginTop: 2,
  },
  itemLineTotal: {
    fontFamily: fonts.bold,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  paymentIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.brandLight,
    borderWidth: 1,
    borderColor: colors.brandBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentIcon: {
    fontSize: 20,
  },
  addressPhoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  landmarkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  paymentTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  paymentSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },
  notesInput: {
    fontFamily: fonts.regular,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 12,
    fontSize: 12,
    color: colors.textPrimary,
    minHeight: 50,
    textAlignVertical: 'top',
  },
  summaryBox: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 4,
  },
  summaryLine: {
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
    fontWeight: '600',
    color: colors.textPrimary,
  },
  complimentaryText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    fontWeight: '700',
    color: '#10b981',
    letterSpacing: 0.5,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  finalTotalLabel: {
    fontFamily: fonts.bold,
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  finalTotalValue: {
    fontFamily: fonts.bold,
    fontSize: 18,
    fontWeight: '800',
    color: colors.brand,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 12,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  bottomPriceCol: {
    flex: 1,
  },
  bottomPriceLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  bottomPriceValue: {
    fontFamily: fonts.bold,
    fontSize: 18,
    fontWeight: '800',
    color: colors.brand,
  },
  placeOrderBtn: {
    backgroundColor: colors.brand,
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: 14,
    shadowColor: colors.brandDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 4,
  },
  placeOrderBtnDisabled: {
    opacity: 0.6,
  },
  placeOrderBtnText: {
    fontFamily: fonts.bold,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  // Modal Backdrops
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalCloseText: {
    fontSize: 18,
    color: colors.textMuted,
  },
  pickerAddressCard: {
    backgroundColor: colors.background,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerAddressCardSelected: {
    borderColor: colors.brand,
    borderWidth: 1.5,
  },
  selectedCheck: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  selectedCheckText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    fontWeight: '800',
    color: colors.brand,
  },
  addAddressModalBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.brand,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginTop: 6,
  },
  addAddressModalText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    fontWeight: '700',
    color: colors.brand,
  },
  // Success Modal
  successBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.brandBorder,
  },
  successIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.brandLight,
    borderWidth: 1,
    borderColor: colors.brandBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  successOrderNumber: {
    fontFamily: fonts.bold,
    fontSize: 14,
    fontWeight: '700',
    color: colors.brand,
    marginBottom: 12,
  },
  successMessage: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  successTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: colors.surfaceLight,
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  successTotalLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  successTotalValue: {
    fontFamily: fonts.bold,
    fontSize: 15,
    fontWeight: '800',
    color: colors.brand,
  },
  successBtn: {
    backgroundColor: colors.brand,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: colors.brandDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  successBtnText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
});
