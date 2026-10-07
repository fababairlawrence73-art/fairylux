import React from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DrawerActions, useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { FairyLuxIcon } from './FairyLuxIcon';

// Screens that already have a parent SafeAreaView providing top inset
const SCREENS_WITH_PARENT_SAFE_AREA = [
  'Cart',
  'Orders',
  'Profile',
  'Wishlist',
  'Notifications',
  'Addresses',
  'My Addresses',
  'Support',
  'Help & Support',
  'About',
  'About FairyLux',
];

export function Header({
  title = 'FairyLux',
  subtitle = 'LUXURY GOWN BOUTIQUE',
  showDrawer = true,
  onBack,
  safeArea,
}) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  let routeName = '';
  try {
    const route = useRoute();
    routeName = route?.name || '';
  } catch (e) {
    // Outside route context
  }

  const applyTopInset =
    safeArea !== undefined
      ? safeArea
      : insets.top > 0 && !SCREENS_WITH_PARENT_SAFE_AREA.includes(routeName);

  const topPadding = applyTopInset ? insets.top : 0;

  const handleOpenDrawer = () => {
    try {
      navigation.dispatch(DrawerActions.openDrawer());
    } catch (e) {
      if (typeof navigation.openDrawer === 'function') {
        navigation.openDrawer();
      }
    }
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <View style={styles.contentRow}>
        {/* Left Slot — Drawer / Back */}
        <View style={styles.leftSlot}>
          {onBack ? (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onBack}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <FairyLuxIcon name="arrow-left" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          ) : showDrawer ? (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleOpenDrawer}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              {/* Refined 3-line luxury hamburger */}
              <View style={styles.hamburger}>
                <View style={[styles.burgerLine, { width: 20 }]} />
                <View style={[styles.burgerLine, { width: 14, backgroundColor: colors.brand }]} />
                <View style={[styles.burgerLine, { width: 18 }]} />
              </View>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 36 }} />
          )}
        </View>

        {/* Center Slot — Brand */}
        <View style={styles.centerSlot}>
          <Text style={styles.brandTitle} numberOfLines={1}>{title}</Text>
          {subtitle ? (
            <Text style={styles.brandSubtitle} numberOfLines={1}>{subtitle}</Text>
          ) : null}
        </View>

        {/* Right Slot — Spacer for visual balance */}
        <View style={styles.rightSlot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    elevation: 2,
    shadowColor: colors.brandDark,
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  contentRow: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  leftSlot: {
    width: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  centerSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  rightSlot: {
    width: 36,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  brandTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  brandSubtitle: {
    fontFamily: fonts.semiBold,
    fontSize: 8.5,
    fontWeight: '700',
    color: colors.brand,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginTop: 1,
    textAlign: 'center',
  },
  iconButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hamburger: {
    height: 14,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  burgerLine: {
    height: 2,
    backgroundColor: colors.textPrimary,
    borderRadius: 1.5,
  },
});

export default Header;
