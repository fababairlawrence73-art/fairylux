import React, { useState } from 'react';
import { FairyLuxIcon } from '../components/FairyLuxIcon';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export function CompleteProfileScreen({ route, navigation }) {
  const { user, profile, onProfileUpdated } = route?.params || {};

  const [firstName, setFirstName] = useState(profile?.firstName || '');
  const [lastName, setLastName] = useState(profile?.lastName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [size, setSize] = useState(profile?.preferredSize || 'US 6');
  const [weddingDate, setWeddingDate] = useState(profile?.weddingDate || '');
  const [saving, setSaving] = useState(false);

  const SIZES = ['US 2', 'US 4', 'US 6', 'US 8', 'US 10', 'US 12', 'Custom Fit'];

  const handleSave = () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Required Fields', 'Please provide your first and last name.');
      return;
    }

    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      const updated = {
        ...profile,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        preferredSize: size,
        weddingDate: weddingDate.trim(),
      };

      if (onProfileUpdated) {
        onProfileUpdated(updated);
      }

      Alert.alert(
        'Profile Completed',
        'Your profile details and preferences have been saved.',
        [
          {
            text: 'Return to Profile',
            onPress: () => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('MainTabs', { screen: 'Profile' });
              }
            },
          },
        ]
      );
    }, 600);
  };

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
        <Text style={styles.headerTitle}>Complete Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.heroCard}>
            <Text style={styles.heroBadge}>CUSTOMER PROFILE</Text>
            <Text style={styles.heroTitle}>Measurements & Sizing</Text>
            <Text style={styles.heroSubtitle}>
              Help us recommend the perfect gown sizes and fit for your upcoming special occasions.
            </Text>
          </View>

          {/* First & Last Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>First Name *</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="e.g. Maria"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Last Name *</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="e.g. Santos"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {/* Contact Phone */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Mobile Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="e.g. +63 917 123 4567"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
            />
          </View>

          {/* Delivery / Fitting Address */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Delivery / Private Fitting Address</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={address}
              onChangeText={setAddress}
              placeholder="Unit / House No., Street, City, Metro Manila"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Preferred Gown Size */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Preferred Gown Sizing</Text>
            <View style={styles.sizesRow}>
              {SIZES.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.sizePill, size === s && styles.sizePillActive]}
                  onPress={() => setSize(s)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[styles.sizePillText, size === s && styles.sizePillTextActive]}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Event / Wedding Date */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Celebration / Wedding Milestone Date (Optional)</Text>
            <TextInput
              style={styles.input}
              value={weddingDate}
              onChangeText={setWeddingDate}
              placeholder="e.g. December 2026"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {/* Submit CTA */}
          <TouchableOpacity
            style={[styles.submitBtn, saving && styles.btnDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Text style={styles.submitBtnText}>
              {saving ? 'Saving Client Profile...' : 'Save & Continue'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  heroCard: {
    backgroundColor: colors.brandLight,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.brandBorder,
    marginBottom: 20,
  },
  heroBadge: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: colors.brand,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  multilineInput: {
    minHeight: 75,
    textAlignVertical: 'top',
  },
  sizesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sizePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sizePillActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  sizePillText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  sizePillTextActive: {
    color: '#ffffff',
  },
  submitBtn: {
    backgroundColor: colors.brand,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: fonts.semiBold,
    letterSpacing: 0.4,
  },
});

export default CompleteProfileScreen;
