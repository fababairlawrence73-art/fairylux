import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useNotifications } from '../context/NotificationContext';
import { FairyLuxIcon } from './FairyLuxIcon';

const SECONDARY_ITEMS = [
  { name: 'Wishlist',       label: 'My Wishlist',    icon: 'heart' },
  { name: 'Notifications', label: 'Notifications',  icon: 'bell', isNotifications: true },
  { name: 'Addresses',     label: 'My Addresses',   icon: 'pin' },
  { name: 'Support',       label: 'Help & Support', icon: 'chat' },
  { name: 'About',         label: 'About FairyLux', icon: 'sparkle' },
];

export default function CustomDrawerContent(props) {
  const insets = useSafeAreaInsets();
  const { userProfile, user } = props;
  const { unreadCount } = useNotifications();

  const currentRouteName =
    props.state.routes[props.state.index]?.name || '';

  const fullName = userProfile
    ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || 'FairyLux Customer'
    : 'FairyLux Customer';

  const initials = userProfile
    ? `${(userProfile.firstName || '').charAt(0)}${(userProfile.lastName || '').charAt(0)}`.toUpperCase() || 'FL'
    : 'FL';

  return (
    <View style={styles.container}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16 },
        ]}>
        {/* Atelier Drawer Header */}
        <View style={styles.header}>
          <View style={styles.avatarCircle}>
            {userProfile?.photoURL ? (
              <Image
                source={{ uri: userProfile.photoURL }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
          </View>
          <Text style={styles.userName} numberOfLines={1}>
            {fullName}
          </Text>
          <Text style={styles.atelierLabel}>FairyLux Member</Text>
        </View>

        <View style={styles.divider} />

        {/* Section Title */}
        <Text style={styles.sectionHeader}>Customer Support</Text>

        {/* Secondary Drawer Items (No Home/Shop/Cart/Orders/Profile/Logout) */}
        {SECONDARY_ITEMS.map((item) => {
          const isActive = currentRouteName === item.name;
          // For the Notifications item, use real unreadCount; for others, no badge
          const badgeValue = item.isNotifications
            ? (unreadCount > 0 ? (unreadCount > 99 ? '99+' : String(unreadCount)) : null)
            : null;

          return (
            <TouchableOpacity
              key={item.name}
              style={[styles.menuItem, isActive && styles.menuItemActive]}
              onPress={() => props.navigation.navigate(item.name)}
              activeOpacity={0.75}>
              <View style={styles.menuLeft}>
                <View style={{ width: 22, alignItems: 'center', marginRight: 14 }}>
                  <FairyLuxIcon
                    name={item.icon}
                    size={18}
                    color={isActive ? colors.gold : colors.primary}
                  />
                </View>
                <Text
                  style={[
                    styles.menuLabel,
                    isActive && styles.menuLabelActive,
                  ]}>
                  {item.label}
                </Text>
              </View>

              {badgeValue ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badgeValue}</Text>
                </View>
              ) : (
                <Text style={styles.chevron}>›</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </DrawerContentScrollView>

      {/* Footer Branding */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Text style={styles.footerBrand}>FairyLux</Text>
        <Text style={styles.footerTagline}>LUXURY GOWN BOUTIQUE</Text>
        <Text style={styles.footerVersion}>Version 1.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'flex-start',
  },
  avatarCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  avatarImage: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 2,
  },
  atelierLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gold,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 12,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  menuItemActive: {
    backgroundColor: colors.goldLight,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 14,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  menuLabelActive: {
    color: colors.gold,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: colors.gold,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  chevron: {
    fontSize: 18,
    color: colors.textMuted,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  footerBrand: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  footerTagline: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.gold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  footerVersion: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
  },
});

export { CustomDrawerContent };

