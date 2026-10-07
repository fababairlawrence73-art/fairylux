import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { FairyLuxIcon } from '../components/FairyLuxIcon';

export function TermsScreen({ navigation }) {
  const sections = [
    {
      title: '1. Fitting & Consultation Appointments',
      content:
        'Private bridal fittings at FairyLux require prior reservation through our mobile application or customer service desk. We reserve gowns in your requested style for the reserved time window.',
    },
    {
      title: '2. Made-to-Measure & Alteration Agreements',
      content:
        'All custom-ordered gowns include up to two complimentary fitting appointments with our master tailors. Custom pattern adjustments, specialized lace trims, and structural modifications are non-refundable once cutting commences.',
    },
    {
      title: '3. Boutique Reservations & Security Deposits',
      content:
        'Gown reservations require authorization of the reservation deposit. Cancellation or rescheduling may be requested up to 48 hours prior to the designated fitting appointment without penalty.',
    },
    {
      title: '4. Delivery & Inspection',
      content:
        'Finished gowns are packaged in premium bridal storage cases and dispatched via secure courier. Inspection is conducted upon delivery turnover.',
    },
    {
      title: '5. Intellectual Property',
      content:
        'All FairyLux designs, embroideries, crystal patterns, and garment imagery remain the exclusive property of FairyLux.',
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
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.introCard}>
          <Text style={styles.brandTitle}>FAIRYLUX</Text>
          <Text style={styles.introHeading}>Terms of Service & Boutique Policies</Text>
          <Text style={styles.introDate}>Last updated: September 2026</Text>
          <Text style={styles.introDesc}>
            Please review the standard terms governing fitting appointments, tailoring, and gown reservations at FairyLux.
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
            For inquiries regarding our terms, please contact support@fairylux.com or call our BGC boutique at +63 (2) 8888 3247.
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

export default TermsScreen;
