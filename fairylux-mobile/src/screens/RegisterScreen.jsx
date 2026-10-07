import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
} from '@react-native-firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
} from '@react-native-firebase/firestore';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { getFriendlyErrorMessage, withTimeout } from '../services/authHelpers';

export function RegisterScreen({ navigation, setIsRegisteringEmail }) {
  const insets = useSafeAreaInsets();
  const auth = getAuth();
  const db = getFirestore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async () => {
    setErrorMessage('');
    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim();

    if (!cleanFirst) {
      setErrorMessage('Please enter your first name.');
      return;
    }
    if (!cleanLast) {
      setErrorMessage('Please enter your last name.');
      return;
    }
    if (!cleanPhone) {
      setErrorMessage('Please enter your phone number.');
      return;
    }
    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    let createdUser = null;
    try {
      if (setIsRegisteringEmail) {
        setIsRegisteringEmail(true);
      }

      // 1. Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        cleanEmail,
        password,
      );
      createdUser = userCredential.user;

      // 2. Create Firestore Customer Profile document under users/{uid}
      const userDocRef = doc(db, 'users', createdUser.uid);
      const profileData = {
        uid: createdUser.uid,
        firstName: cleanFirst,
        lastName: cleanLast,
        email: cleanEmail,
        phone: cleanPhone,
        role: 'customer',
        photoURL: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await withTimeout(setDoc(userDocRef, profileData), 8000);

      // 3. Immediately sign out the newly created user so they can sign in cleanly
      await signOut(auth);

      if (setIsRegisteringEmail) {
        setIsRegisteringEmail(false);
      }

      // 4. Navigate to Login screen with success message
      navigation.navigate('Login', {
        successMessage: 'Account created successfully. Please sign in.',
      });
    } catch (err) {
      if (setIsRegisteringEmail) {
        setIsRegisteringEmail(false);
      }
      if (createdUser) {
        try {
          await signOut(auth);
        } catch (e) {
          // ignore
        }
      }
      if (createdUser && err.code?.startsWith('firestore/')) {
        setErrorMessage(
          'Account created, but could not set up your profile in Firestore: ' +
            getFriendlyErrorMessage(err),
        );
      } else {
        setErrorMessage(getFriendlyErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
        ]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          {/* Brand Monogram */}
          <View style={styles.brandMonogram}>
            <Text style={styles.monogramText}>FL</Text>
          </View>

          <Text style={styles.brandTitle}>FAIRYLUX</Text>
          <Text style={styles.brandTagline}>LUXURY GOWN BOUTIQUE</Text>
          <Text style={styles.cardSubtitle}>Create Customer Account</Text>

          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* First Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Maria"
              placeholderTextColor="#94a3b8"
              autoCapitalize="words"
              autoCorrect={false}
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text);
                if (errorMessage) setErrorMessage('');
              }}
            />
          </View>

          {/* Last Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Santos"
              placeholderTextColor="#94a3b8"
              autoCapitalize="words"
              autoCorrect={false}
              value={lastName}
              onChangeText={(text) => {
                setLastName(text);
                if (errorMessage) setErrorMessage('');
              }}
            />
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 09171234567"
              placeholderTextColor="#94a3b8"
              keyboardType="phone-pad"
              autoCorrect={false}
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                if (errorMessage) setErrorMessage('');
              }}
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="customer@example.com"
              placeholderTextColor="#94a3b8"
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errorMessage) setErrorMessage('');
              }}
            />
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <View style={styles.passwordHeader}>
              <Text style={styles.label}>Password</Text>
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.showHideText}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="At least 6 characters"
              placeholderTextColor="#94a3b8"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errorMessage) setErrorMessage('');
              }}
            />
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Re-enter your password"
              placeholderTextColor="#94a3b8"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errorMessage) setErrorMessage('');
              }}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}>
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Switch to Sign In */}
          <View style={styles.switchRow}>
            <Text style={styles.switchPrompt}>Already have an account?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              disabled={loading}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.switchLink}> Sign In</Text>
            </TouchableOpacity>
          </View>

          {/* Legal Links */}
          <View style={styles.legalRow}>
            <TouchableOpacity onPress={() => navigation.navigate('Terms')}>
              <Text style={styles.legalLink}>Terms & Conditions</Text>
            </TouchableOpacity>
            <Text style={styles.legalDot}>•</Text>
            <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')}>
              <Text style={styles.legalLink}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#0c0a10',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  brandMonogram: {
    width: 60,
    height: 60,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(190, 24, 93, 0.4)',
    backgroundColor: 'rgba(190, 24, 93, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  monogramText: {
    fontFamily: fonts.bold,
    fontSize: 22,
    fontWeight: '800',
    color: colors.brand,
    letterSpacing: 2,
  },
  card: {
    backgroundColor: 'rgba(26, 20, 30, 0.90)',
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 24,
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: '#38222f',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  brandTitle: {
    fontFamily: fonts.bold,
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  brandTagline: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    fontWeight: '700',
    color: colors.gold,
    textAlign: 'center',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginTop: 4,
    marginBottom: 8,
  },
  cardSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    fontWeight: '600',
    color: '#e2e8f0',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  input: {
    fontFamily: fonts.regular,
    backgroundColor: 'rgba(12, 10, 16, 0.85)',
    borderWidth: 1,
    borderColor: '#38222f',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#ffffff',
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  showHideText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.brand,
    fontWeight: '600',
  },
  button: {
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: colors.brand, // Rich Deep Rose / Berry Pink
    shadowColor: colors.brandDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontFamily: fonts.bold,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  switchPrompt: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: '#94a3b8',
  },
  switchLink: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.brand,
    fontWeight: '700',
  },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#38222f',
  },
  legalLink: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  legalDot: {
    marginHorizontal: 8,
    color: '#475569',
    fontSize: 12,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  errorText: {
    fontFamily: fonts.medium,
    color: '#fca5a5',
    fontSize: 12.5,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 18,
  },
});

export default RegisterScreen;
