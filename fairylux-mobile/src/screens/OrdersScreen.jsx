import React, { useState, useCallback } from 'react';
import { FairyLuxIcon } from '../components/FairyLuxIcon';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { Header } from '../components/Header';
import { FairyLuxImage } from '../components/FairyLuxImage';
import { fetchOrders } from '../services/api';

export function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSegment, setActiveSegment] = useState('all'); // 'all' | 'active' | 'completed'

  const loadOrders = useCallback(async (isPull = false) => {
    try {
      if (isPull) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const data = await fetchOrders();
      setOrders(data);
    } catch (err) {
      console.warn('Could not load orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  const filteredOrders = (orders || []).filter((o) => {
    const status = (o.status || '').toLowerCase();
    if (activeSegment === 'active') {
      return (
        status === 'pending' ||
        status === 'confirmed' ||
        status === 'processing' ||
        status === 'shipped'
      );
    }
    if (activeSegment === 'completed') {
      return (
        status === 'delivered' ||
        status === 'completed'
      );
    }
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return { label: 'PENDING', bg: 'rgba(245, 158, 11, 0.12)', text: '#d97706', border: 'rgba(245, 158, 11, 0.35)' };
      case 'confirmed':
        return { label: 'CONFIRMED', bg: 'rgba(14, 165, 233, 0.12)', text: '#0284c7', border: 'rgba(14, 165, 233, 0.35)' };
      case 'processing':
        return { label: 'IN PROCESS', bg: 'rgba(59, 130, 246, 0.12)', text: '#2563eb', border: 'rgba(59, 130, 246, 0.35)' };
      case 'shipped':
        return { label: 'SHIPPED', bg: 'rgba(168, 85, 247, 0.12)', text: '#9333ea', border: 'rgba(168, 85, 247, 0.35)' };
      case 'delivered':
      case 'completed':
        return { label: 'DELIVERED', bg: 'rgba(16, 185, 129, 0.12)', text: '#059669', border: 'rgba(16, 185, 129, 0.35)' };
      case 'cancelled':
        return { label: 'CANCELLED', bg: 'rgba(239, 68, 68, 0.12)', text: '#dc2626', border: 'rgba(239, 68, 68, 0.35)' };
      default:
        return { label: (status || 'PENDING').toUpperCase(), bg: colors.surfaceLight, text: colors.textSecondary, border: colors.border };
    }
  };

  const renderOrderItem = ({ item }) => {
    const badge = getStatusBadge(item.status);

    return (
      <TouchableOpacity
        style={styles.orderCard}
        activeOpacity={0.88}
        onPress={() => navigation.navigate('OrderDetails', { orderId: item.id, orderNumber: item.order_number })}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderNumber}>{item.order_number}</Text>
            <Text style={styles.orderDate}>{item.formatted_date}</Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: badge.bg, borderColor: badge.border }]}>
            <Text style={[styles.statusText, { color: badge.text }]}>
              {badge.label}
            </Text>
          </View>
        </View>

        <View style={styles.previewRow}>
          <FairyLuxImage
            source={{ uri: item.preview_image }}
            style={styles.previewImage}
            resizeMode="cover"
            placeholderText="Gown"
          />
          <View style={styles.previewInfo}>
            <Text style={styles.previewTitle} numberOfLines={1}>
              {item.preview_title}
            </Text>
            <Text style={styles.previewVariant} numberOfLines={1}>
              {item.preview_variant}
            </Text>
            <Text style={styles.itemsCount}>
              {item.items_count} item{item.items_count > 1 ? 's' : ''} in reservation
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              ₱{item.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={styles.viewDetailsBtn}>
            <Text style={styles.viewDetailsText}>View Order ›</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="My Orders" navigation={navigation} />

      {/* Segment Selector */}
      <View style={styles.segmentContainer}>
        {[
          { key: 'all', label: 'All Orders' },
          { key: 'active', label: 'In Process' },
          { key: 'completed', label: 'Delivered' },
        ].map((tab) => {
          const isActive = activeSegment === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.segmentBtn, isActive && styles.segmentBtnActive]}
              onPress={() => setActiveSegment(tab.key)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.segmentText,
                  isActive && styles.segmentTextActive,
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading && orders.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.loadingText}>Retrieving your orders...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          extraData={activeSegment}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderOrderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadOrders(true)}
              tintColor={colors.gold}
            />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FairyLuxIcon name="orders" size={50} color={colors.gold} style={{ marginBottom: 12, opacity: 0.5 }} />
              <Text style={styles.emptyTitle}>No Orders Yet</Text>
              <Text style={styles.emptySubtitle}>
                {activeSegment === 'all'
                  ? 'Your placed gown orders will appear here.'
                  : activeSegment === 'active'
                  ? 'No in-process orders found.'
                  : 'No delivered orders found.'}
              </Text>
              <TouchableOpacity
                style={styles.browseBtn}
                onPress={() => navigation.navigate('Shop')}
              >
                <Text style={styles.browseBtnText}>Explore Collection</Text>
              </TouchableOpacity>
            </View>
          }
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.gold,
    fontSize: 13,
    marginTop: 12,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: 4,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    height: 44,
  },
  segmentBtn: {
    flex: 1,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 6,
  },
  segmentBtnActive: {
    backgroundColor: colors.brand,
    elevation: 2,
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.25,
    shadowRadius: 2.5,
  },
  segmentText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  segmentTextActive: {
    color: '#ffffff',
    fontFamily: fonts.semiBold,
  },
  listContent: {
    padding: 16,
    paddingTop: 4,
    paddingBottom: 30,
  },
  orderCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  orderNumber: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.brand,
    letterSpacing: 0.3,
  },
  orderDate: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 24,
  },
  statusText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  previewImage: {
    width: 54,
    height: 68,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
  },
  previewInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  previewTitle: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  previewVariant: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    marginTop: 2,
  },
  itemsCount: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  totalLabel: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalValue: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.gold,
  },
  viewDetailsBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewDetailsText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.brand,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  browseBtn: {
    backgroundColor: colors.brand,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  browseBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontFamily: fonts.semiBold,
    letterSpacing: 0.3,
  },
});
