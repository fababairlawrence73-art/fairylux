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
  signInWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
} from '@react-native-firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from '@react-native-firebase/firestore';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { getFriendlyErrorMessage, withTimeout } from '../services/authHelpers';

export function LoginScreen({ navigation, route, onProfileLoaded }) {
  const insets = useSafeAreaInsets();
  const auth = getAuth();
  const db = getFirestore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const successMessage = route?.params?.successMessage || '';

  const handleEmailSignIn = async () => {
    setErrorMessage('');
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, cleanEmail, password);
      // onAuthStateChanged in App.jsx will automatically transition to main app
    } catch (err) {
      setErrorMessage(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setGoogleLoading(true);

    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();

      if (response?.type === 'cancelled') {
        setGoogleLoading(false);
        return;
      }

      const idToken = response?.data?.idToken || response?.idToken;
      if (!idToken) {
        throw new Error('Could not obtain Google ID token. Please try again.');
      }

      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      const authUser = userCredential.user;

      const userDocRef = doc(db, 'users', authUser.uid);
      const docSnap = await withTimeout(getDoc(userDocRef), 8000);

      if (!docSnap.exists()) {
        let parsedFirst = '';
        let parsedLast = '';
        if (authUser.displayName) {
          const parts = authUser.displayName.trim().split(/\s+/);
          parsedFirst = parts[0] || '';
          parsedLast = parts.slice(1).join(' ') || '';
        }

        const newProfile = {
          uid: authUser.uid,
          firstName: parsedFirst || 'Valued',
          lastName: parsedLast || 'Customer',
          email: authUser.email || '',
          phone: authUser.phoneNumber || null,
          photoURL: authUser.photoURL || null,
          role: 'customer',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await withTimeout(setDoc(userDocRef, newProfile), 8000);
        if (onProfileLoaded) {
          onProfileLoaded(newProfile);
        }
      } else if (onProfileLoaded) {
        onProfileLoaded(docSnap.data());
      }
    } catch (err) {
      if (
        err.code === statusCodes.SIGN_IN_CANCELLED ||
        err.message?.includes('cancelled')
      ) {
        return;
      }
      setErrorMessage(getFriendlyErrorMessage(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  const isActionDisabled = loading || googleLoading;

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
          <Text style={styles.cardSubtitle}>Customer Sign In</Text>

          {successMessage ? (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          ) : null}

          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Email Field */}
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

          {/* Password Field */}
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
              placeholder="Enter your password"
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

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleEmailSignIn}
            disabled={isActionDisabled}
            activeOpacity={0.8}>
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Continue with Google */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[styles.button, styles.googleButton]}
            onPress={handleGoogleSignIn}
            disabled={isActionDisabled}
            activeOpacity={0.8}>
            {googleLoading ? (
              <ActivityIndicator color="#0f172a" />
            ) : (
              <View style={styles.googleButtonContent}>
                <View style={styles.googleBadge}>
                  <Text style={styles.googleBadgeText}>G</Text>
                </View>
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Switch to Register */}
          <View style={styles.switchRow}>
            <Text style={styles.switchPrompt}>Don't have an account?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              disabled={isActionDisabled}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.switchLink}> Register</Text>
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
    backgroundColor: '#0c0a10', // Deep Velvet Midnight
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
    marginBottom: 16,
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    fontWeight: '600',
    color: '#e2e8f0',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  input: {
    fontFamily: fonts.regular,
    backgroundColor: 'rgba(12, 10, 16, 0.85)',
    borderWidth: 1,
    borderColor: '#38222f',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
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
    marginTop: 6,
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#38222f',
  },
  dividerText: {
    fontFamily: fonts.medium,
    marginHorizontal: 12,
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  googleButton: {
    backgroundColor: 'rgba(12, 10, 16, 0.85)',
    borderWidth: 1,
    borderColor: '#38222f',
    marginTop: 0,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  googleBadgeText: {
    fontFamily: fonts.bold,
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  googleButtonText: {
    fontFamily: fonts.semiBold,
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
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
  successContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  successText: {
    fontFamily: fonts.medium,
    color: '#6ee7b7',
    fontSize: 12.5,
    textAlign: 'center',
    fontWeight: '500',
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

export default LoginScreen;
