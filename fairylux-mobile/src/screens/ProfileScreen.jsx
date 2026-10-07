import React from 'react';
import { FairyLuxIcon } from '../components/FairyLuxIcon';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { Header } from '../components/Header';

export function ProfileScreen({ navigation, user, profile, onLogout }) {
  const displayName = profile
    ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || user?.displayName || 'Valued Customer'
    : user?.displayName || 'Valued Customer';

  const email = profile?.email || user?.email || 'customer@fairylux.com';
  const phone = profile?.phone || 'Add phone number';
  const photoURL = profile?.photoURL || user?.photoURL || null;

  const getInitials = (name) => {
    if (!name) return 'FL';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of your FairyLux account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          if (onLogout) {
            onLogout();
          }
        },
      },
    ]);
  };

  const menuSections = [
    {
      title: 'Account / Legal',
      items: [
        { title: 'Terms & Conditions', iconName: 'document', screen: 'Terms' },
        { title: 'Privacy Policy',     iconName: 'lock',     screen: 'PrivacyPolicy' },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="My Account" navigation={navigation} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header / Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            {photoURL ? (
              <Image source={{ uri: photoURL }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
            )}
          </View>
          <View style={styles.profileDetails}>
            <View style={styles.vipBadge}>
              <Text style={styles.vipBadgeText}>FairyLux VIP Client</Text>
            </View>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userEmail}>{email}</Text>
            <Text style={styles.userPhone}>{phone}</Text>
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('EditProfile', { user, profile })}
          >
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Account / Legal */}
        {menuSections.map((sec, secIdx) => (
          <View key={secIdx} style={styles.section}>
            <Text style={styles.sectionTitle}>{sec.title}</Text>
            <View style={styles.menuCard}>
              {sec.items.map((item, itemIdx) => (
                <React.Fragment key={itemIdx}>
                  <TouchableOpacity
                    style={styles.menuRow}
                    onPress={() => navigation.navigate(item.screen)}
                  >
                    <View style={styles.menuLeft}>
                        <View style={styles.menuIconView}>
                          <FairyLuxIcon name={item.iconName} size={16} color={colors.gold} />
                        </View>
                        <Text style={styles.menuLabel}>{item.title}</Text>
                      </View>
                    <Text style={styles.menuChevron}>›</Text>
                  </TouchableOpacity>
                  {itemIdx < sec.items.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}

        {/* Account Action */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Action</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutBtnText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Version Info */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>FairyLux Mobile • Version 1.0.0</Text>
          <Text style={styles.legalText}>Luxury Gown Boutique</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.gold,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarText: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.gold,
  },
  profileDetails: {
    flex: 1,
    marginLeft: 14,
  },
  vipBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.brandLight,
    borderWidth: 1,
    borderColor: colors.brandBorder,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    marginBottom: 4,
  },
  vipBadgeText: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: colors.brand,
    letterSpacing: 0.8,
  },
  userName: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  userEmail: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    marginTop: 2,
  },
  userPhone: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  editBtn: {
    backgroundColor: colors.brand,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  editBtnText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: '#ffffff',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconView: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
  },
  menuChevron: {
    fontSize: 20,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 52,
  },
  logoutBtn: {
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutBtnText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.danger,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 4,
    paddingBottom: 8,
  },
  versionText: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  legalText: {
    fontSize: 10,
    fontFamily: fonts.medium,
    color: colors.brand,
    marginTop: 2,
    letterSpacing: 0.8,
  },
});

export default ProfileScreen;
