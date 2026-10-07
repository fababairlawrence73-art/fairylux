import React, { useCallback } from 'react';
import { FairyLuxIcon } from '../components/FairyLuxIcon';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { Header } from '../components/Header';
import { useNotifications } from '../context/NotificationContext';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(date) {
  if (!date) return '';
  const now = new Date();
  const diff = Math.floor((now - date) / 1000); // seconds

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

// Status icon mapping — renders a FairyLuxIcon based on order status
function getStatusIcon(status, size = 20, color = '#b45309') {
  const map = {
    confirmed:  'check',
    processing: 'scissors',
    completed:  'sparkle',
    cancelled:  'close',
    shipped:    'orders',
    delivered:  'crown',
  };
  return <FairyLuxIcon name={map[status] ?? 'bell'} size={size} color={color} />;
}

// ─── Notification Card ────────────────────────────────────────────────────────

function NotificationCard({ item, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.card, !item.read && styles.cardUnread]}
      onPress={() => onPress(item)}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`Notification: ${item.title}`}>
      <View style={styles.iconCircle}>
        {getStatusIcon(item.orderStatus)}
      </View>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
        {item.orderNumber ? (
          <Text style={styles.orderNumber}>Order #{item.orderNumber}</Text>
        ) : null}
        <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export function NotificationsScreen({ navigation }) {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } =
    useNotifications();

  const handleNotificationPress = useCallback(
    async (item) => {
      // 1. Mark as read
      if (!item.read) {
        await markAsRead(item.id);
      }

      // 2. Navigate to order details if we have an orderId
      if (item.orderId) {
        try {
          navigation.navigate('OrderDetails', {
            orderId: item.orderId,
            orderNumber: item.orderNumber,
          });
        } catch (e) {
          console.warn('[NotificationsScreen] Could not navigate to OrderDetails:', e);
        }
      }
    },
    [markAsRead, navigation],
  );

  const renderItem = useCallback(
    ({ item }) => (
      <NotificationCard item={item} onPress={handleNotificationPress} />
    ),
    [handleNotificationPress],
  );

  const keyExtractor = useCallback((item) => item.id, []);

  const ListEmpty = (
    <View style={styles.emptyContainer}>
      <FairyLuxIcon name="bell" size={50} color={colors.gold} style={{ marginBottom: 12, opacity: 0.5 }} />
      <Text style={styles.emptyTitle}>No notifications yet</Text>
      <Text style={styles.emptySubtitle}>
        You'll receive updates here when your order status changes.
      </Text>
    </View>
  );



  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="Notifications" showDrawer navigation={navigation} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.notificationCount}>
          {unreadCount > 0 ? `${unreadCount} Unread` : 'All read'}
        </Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllAsRead} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.markReadText}>Mark all as read</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Loading */}
      {loading && notifications.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.gold} />
          <Text style={styles.loadingText}>Loading notifications…</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={ListEmpty}
          showsVerticalScrollIndicator={false}
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  notificationCount: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  markReadText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.brand,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardUnread: {
    borderColor: colors.brand,
    backgroundColor: colors.brandLight,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.brandBorder,
    marginRight: 12,
    flexShrink: 0,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
    flex: 1,
    paddingRight: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand,
    flexShrink: 0,
  },
  orderNumber: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.brand,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  message: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 4,
  },
  time: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    marginTop: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
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
    lineHeight: 20,
  },
});
