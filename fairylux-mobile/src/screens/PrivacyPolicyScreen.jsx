import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { FairyLuxIcon } from '../components/FairyLuxIcon';

export function PrivacyPolicyScreen({ navigation }) {
  const sections = [
    {
      title: '1. Client Confidentiality',
      content:
        'FairyLux upholds the highest degree of discretion regarding your bridal fittings, gown selections, and personal itineraries. Private fitting details are never shared publicly without express authorization.',
    },
    {
      title: '2. Personal Measurements & Sizing Profiles',
      content:
        'Measurements gathered during fitting sessions (bust, waist, hip, hollow-to-hem, train preferences) are securely retained solely for sizing and tailoring accuracy across your orders.',
    },
    {
      title: '3. Authentication & Account Security',
      content:
        'Customer accounts are authenticated via Google Sign-In or encrypted Firebase credentials. We do not store raw payment card numbers on mobile device caches.',
    },
    {
      title: '4. Delivery & Fitting Location Data',
      content:
        'Addresses provided for deliveries or fitting appointments are used strictly for appointment scheduling and order fulfillment.',
    },
    {
      title: '5. Client Rights & Profile Management',
      content:
        'You may view, edit, or request complete removal of your client profile and saved fitting specifications at any time through the Profile management screen or via support@fairylux.com.',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('MainTabs');
            }
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <FairyLuxIcon name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.introCard}>
          <Text style={styles.brandTitle}>FAIRYLUX</Text>
          <Text style={styles.introHeading}>Client Discretion & Privacy Commitment</Text>
          <Text style={styles.introDate}>Last updated: September 2026</Text>
          <Text style={styles.introDesc}>
            Your trust is paramount. Learn how we safeguard your personal milestones, measurements, and account details.
          </Text>
        </View>

        {sections.map((sec, idx) => (
          <View key={idx} style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{sec.title}</Text>
            <Text style={styles.sectionContent}>{sec.content}</Text>
          </View>
        ))}

        <View style={styles.footerNote}>
          <Text style={styles.footerText}>
            FairyLux Boutique • 5th Avenue, Bonifacio High Street Central, BGC, Taguig, Philippines
          </Text>
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
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
    letterSpacing: 0.3,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  introCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.brandBorder,
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.brand,
    letterSpacing: 2.5,
    marginBottom: 6,
  },
  introHeading: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    marginBottom: 4,
    lineHeight: 24,
  },
  introDate: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    marginBottom: 10,
  },
  introDesc: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
    marginBottom: 8,
    lineHeight: 19,
  },
  sectionContent: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  footerNote: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default PrivacyPolicyScreen;
