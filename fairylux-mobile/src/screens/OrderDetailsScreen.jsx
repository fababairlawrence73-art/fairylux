import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { FairyLuxImage } from '../components/FairyLuxImage';
import { FairyLuxIcon } from '../components/FairyLuxIcon';
import { fetchOrder } from '../services/api';

export function OrderDetailsScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const orderId = route.params?.orderId || route.params?.order?.id;
  const initialOrderNumber = route.params?.orderNumber || route.params?.order?.order_number;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const loadOrderDetails = useCallback(async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      setErrorMessage(null);
      const data = await fetchOrder(orderId);
      setOrder(data);
    } catch (err) {
      console.warn('Could not load order details:', err);
      setErrorMessage(err.message || 'Unable to retrieve order details.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrderDetails();
  }, [loadOrderDetails]);

  // Refresh when screen gains focus — picks up real status changes from Laravel
  useFocusEffect(
    useCallback(() => {
      loadOrderDetails();
    }, [loadOrderDetails]),
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return { label: 'PENDING',    bg: 'rgba(245, 158, 11, 0.15)',  text: '#f59e0b', border: '#f59e0b' };
      case 'confirmed':
        return { label: 'CONFIRMED',  bg: 'rgba(14, 165, 233, 0.15)', text: '#0ea5e9', border: '#0ea5e9' };
      case 'processing':
        return { label: 'PROCESSING', bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', border: '#3b82f6' };
      case 'shipped':
        return { label: 'SHIPPED',    bg: 'rgba(168, 85, 247, 0.15)', text: '#a855f7', border: '#a855f7' };
      case 'delivered':
        return { label: 'DELIVERED',  bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', border: '#10b981' };
      case 'completed':
        return { label: 'COMPLETED',  bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', border: '#10b981' };
      case 'cancelled':
        return { label: 'CANCELLED',  bg: 'rgba(239, 68, 68, 0.15)',  text: '#ef4444', border: '#ef4444' };
      default:
        return { label: status?.toUpperCase() || 'UNKNOWN', bg: colors.surfaceLight, text: colors.textSecondary, border: colors.border };
    }
  };

  const badge = getStatusBadge(order?.status);
  const address = order?.delivery_address;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {order?.order_number || initialOrderNumber || 'Order Details'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.centerContainer}>
          <FairyLuxIcon name="warning" size={40} color={colors.gold} style={{ marginBottom: 12 }} />
          <Text style={styles.errorTitle}>Order Unavailable</Text>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={loadOrderDetails}
          >
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : !order ? null : (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 30 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Order Status Banner */}
          <View style={styles.statusCard}>
            <View>
              <Text style={styles.statusLabel}>Order Status</Text>
              <View style={[styles.statusPill, { backgroundColor: badge.bg, borderColor: badge.border }]}>
                <Text style={[styles.statusText, { color: badge.text }]}>
                  {badge.label}
                </Text>
              </View>
            </View>
            <View style={styles.dateCol}>
              <Text style={styles.dateLabel}>Date Placed</Text>
              <Text style={styles.dateVal}>{order.formatted_date}</Text>
            </View>
          </View>

          {/* Delivery Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DELIVERY ADDRESS</Text>
            <View style={styles.addressCard}>
              {address ? (
                <>
                  <Text style={styles.recipientName}>{address.recipient_name}</Text>
                  <View style={styles.addressDetailRow}>
                    <FairyLuxIcon name="phone" size={13} color={colors.gold} style={{ marginRight: 6 }} />
                    <Text style={styles.addressPhone}>{address.phone_number}</Text>
                  </View>
                  <Text style={styles.addressText}>
                    {address.formatted_address || `${address.street_address}, ${address.city}, ${address.state_province}`}
                  </Text>
                  {address.landmark ? (
                    <View style={styles.landmarkRow}>
                      <FairyLuxIcon name="pin" size={13} color={colors.gold} style={{ marginRight: 6, marginTop: 2 }} />
                      <Text style={styles.landmarkText}>Note: {address.landmark}</Text>
                    </View>
                  ) : null}
                </>
              ) : (
                <Text style={styles.noAddressText}>No delivery address recorded for this order.</Text>
              )}
            </View>
          </View>

          {/* Ordered Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              ORDERED ITEMS ({order.items?.length || 0})
            </Text>
            <View style={styles.itemsCard}>
              {order.items?.map((item, idx) => (
                <View
                  key={item.id || idx}
                  style={[styles.itemRow, idx < order.items.length - 1 && styles.itemRowBorder]}
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
                    <Text style={styles.itemVariant}>
                      {item.variant_info}
                    </Text>
                    <Text style={styles.itemQuantity}>
                      Qty: {item.quantity} × ₱{item.unit_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                  <Text style={styles.itemLineTotal}>
                    ₱{item.total_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Notes if present */}
          {order.notes ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SPECIAL DELIVERY INSTRUCTIONS</Text>
              <View style={styles.notesCard}>
                <Text style={styles.notesText}>{order.notes}</Text>
              </View>
            </View>
          ) : null}

          {/* Payment & Totals Breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PAYMENT SUMMARY</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>
                  ₱{order.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery</Text>
                <Text style={styles.complimentaryText}>COMPLIMENTARY</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalValue}>
                  ₱{order.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Payment Method</Text>
                <Text style={styles.paymentMethodText}>
                  {order.payment_method === 'cash_on_delivery' ? 'Cash on Delivery' : order.payment_method}
                </Text>
              </View>
            </View>
          </View>

          {/* Customer Support Action */}
          <TouchableOpacity
            style={styles.conciergeBtn}
            onPress={() =>
              Alert.alert(
                'Customer Support',
                `For inquiries regarding Order #${order.order_number}, our dedicated support team is available 7 days a week. Connect via phone at +63 917 123 4567.`
              )
            }
            activeOpacity={0.85}
          >
            <FairyLuxIcon name="chat" size={16} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.conciergeBtnText}>
              Contact Customer Support for this Order
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
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
    fontFamily: fonts.bold,
    color: colors.brand,
  },
  headerTitle: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
    letterSpacing: 0.3,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    color: colors.gold,
    fontSize: 13,
    marginTop: 12,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  errorText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: colors.gold,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  retryBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
  },
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dateCol: {
    alignItems: 'flex-end',
  },
  dateLabel: {
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  dateVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: colors.textMuted,
    letterSpacing: 1.2,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  addressCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recipientName: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  addressDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  addressPhone: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  addressText: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  landmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  landmarkText: {
    fontSize: 12,
    color: colors.gold,
    fontStyle: 'italic',
  },
  noAddressText: {
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: 'italic',
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
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  itemVariant: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    marginVertical: 2,
  },
  itemQuantity: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  itemLineTotal: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  notesCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notesText: {
    fontSize: 12,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  complimentaryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10b981',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.gold,
  },
  paymentMethodText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  conciergeBtn: {
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 6,
    marginBottom: 20,
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 3,
  },
  conciergeBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontFamily: fonts.semiBold,
    letterSpacing: 0.3,
  },
});
