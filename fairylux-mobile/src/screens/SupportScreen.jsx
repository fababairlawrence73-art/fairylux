import React from 'react';
import { FairyLuxIcon } from '../components/FairyLuxIcon';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { Header } from '../components/Header';

export function SupportScreen({ navigation }) {
  const contactOptions = [
    {
      title: 'Customer Support Specialist',
      desc: 'Connect directly with a gown specialist for sizing, fittings, or inquiries.',
      iconName: 'chat',
      actionText: 'Message via WhatsApp',
      action: () =>
        Alert.alert('Customer Support', 'Opening customer support line (+63 917 123 4567)...'),
    },
    {
      title: 'Phone Assistance',
      desc: 'Speak with our boutique team (Mon - Sun, 9:00 AM - 8:00 PM).',
      iconName: 'phone',
      actionText: 'Call Boutique',
      action: () =>
        Alert.alert('Call Boutique', 'Dialing +63 (2) 8888 3247...'),
    },
    {
      title: 'Email Support',
      desc: 'Send measurements, special requests, or order inquiries.',
      iconName: 'mail',
      actionText: 'Email Support',
      action: () =>
        Alert.alert('Email Support', 'Drafting inquiry to support@fairylux.com...'),
    },
  ];

  const faqs = [
    {
      q: 'How do fitting appointments work?',
      a: 'Once you place an order in the app, our team reserves the gown in your chosen size and arranges your fitting appointment.',
    },
    {
      q: 'Can gowns be custom altered to my measurements?',
      a: 'Yes. All FairyLux gowns include up to two fitting sessions with our master tailors to ensure an impeccable fit.',
    },
    {
      q: 'What is your gown cancellation and deposit policy?',
      a: 'Fitting reservations can be rescheduled or cancelled up to 48 hours before your appointment without penalty.',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="Customer Support" navigation={navigation} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Intro */}
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>FairyLux Customer Support</Text>
          <Text style={styles.introDesc}>
            Our styling and customer support team is devoted to making your gown selection effortless and unforgettable.
          </Text>
        </View>

        {/* Contact Options */}
        <Text style={styles.sectionTitle}>Direct Assistance</Text>
        {contactOptions.map((opt, idx) => (
          <View key={idx} style={styles.contactCard}>
            <View style={styles.contactHeader}>
              <View style={styles.contactIconView}>
                <FairyLuxIcon name={opt.iconName} size={18} color={colors.brand} />
              </View>
              <Text style={styles.contactTitle}>{opt.title}</Text>
            </View>
            <Text style={styles.contactDesc}>{opt.desc}</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={opt.action}>
              <Text style={styles.actionBtnText}>{opt.actionText} →</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* FAQs */}
        <Text style={[styles.sectionTitle, { marginTop: 22 }]}>
          Frequently Asked Questions
        </Text>
        {faqs.map((faq, idx) => (
          <View key={idx} style={styles.faqCard}>
            <Text style={styles.faqQuestion}>{faq.q}</Text>
            <Text style={styles.faqAnswer}>{faq.a}</Text>
          </View>
        ))}
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
  introCard: {
    backgroundColor: colors.brandLight,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.brandBorder,
    marginBottom: 20,
  },
  introTitle: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.brand,
    marginBottom: 6,
  },
  introDesc: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 2,
  },
  contactCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactIconView: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.brandLight,
    borderWidth: 1,
    borderColor: colors.brandBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  contactTitle: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
    flex: 1,
  },
  contactDesc: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 12,
  },
  actionBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.brand,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  actionBtnText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: '#ffffff',
  },
  faqCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  faqQuestion: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
    marginBottom: 6,
    lineHeight: 19,
  },
  faqAnswer: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    lineHeight: 19,
  },
});
