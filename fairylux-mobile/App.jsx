import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  signOut,
} from '@react-native-firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from '@react-native-firebase/firestore';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { NotificationProvider } from './src/context/NotificationContext';
import { colors } from './src/theme/colors';

const GOOGLE_WEB_CLIENT_ID =
  '80924638878-40qi0gqetestqi2dbvverji4n62on9a0.apps.googleusercontent.com';

// Configure Google Sign-In once on startup
GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
});

const fairyLuxTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.gold,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.gold,
  },
};

function getFriendlyErrorMessage(error) {
  if (!error) return '';
  const code = error.code || '';
  const message = error.message || '';

  // Google Sign-In error codes
  if (
    code === statusCodes.SIGN_IN_CANCELLED ||
    code === '12501' ||
    code === 'SIGN_IN_CANCELLED'
  ) {
    return 'Google sign-in was cancelled.';
  }
  if (code === statusCodes.IN_PROGRESS) {
    return 'Google sign-in is currently in progress. Please wait.';
  }
  if (code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
    return 'Google Play Services is not available or outdated on this device.';
  }
  if (code === 'auth/account-exists-with-different-credential') {
    return 'An account already exists with this email using a different sign-in method.';
  }

  // Firebase Auth errors
  if (code === 'auth/invalid-email') {
    return 'Please enter a valid email address.';
  }
  if (
    code === 'auth/user-not-found' ||
    code === 'auth/wrong-password' ||
    code === 'auth/invalid-credential'
  ) {
    return 'Incorrect email or password. Please try again.';
  }
  if (code === 'auth/email-already-in-use') {
    return 'This email is already registered. Please sign in instead.';
  }
  if (code === 'auth/weak-password') {
    return 'Password is too weak. Please use at least 6 characters.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Network connection error. Please check your internet connection.';
  }
  if (code === 'auth/operation-not-allowed') {
    return 'Sign-in method is disabled in Firebase Console. Please verify configuration.';
  }
  if (code === 'auth/too-many-requests') {
    return 'Access temporarily blocked due to many failed attempts. Try again later.';
  }

  // Firestore errors
  if (
    code === 'firestore/permission-denied' ||
    message.includes('Cloud Firestore API has not been used') ||
    message.includes('PERMISSION_DENIED')
  ) {
    return 'Cloud Firestore permission denied. Please verify security rules in Firebase Console.';
  }
  if (code === 'firestore/unavailable') {
    return 'Firestore service is unavailable. Please check your internet connection.';
  }
  if (code === 'firestore/not-found') {
    return 'Customer profile not found.';
  }

  return message || 'An unexpected error occurred. Please try again.';
}

const withTimeout = (
  promise,
  ms = 8000,
  errorMsg = 'Operation timed out. Please check your network connection.',
) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(errorMsg)), ms),
    ),
  ]);
};

function AuthScreen({ onProfileLoaded, setIsRegisteringEmail }) {
  const insets = useSafeAreaInsets();
  const auth = getAuth();
  const db = getFirestore();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const switchMode = (newMode) => {
    setMode(newMode);
    setErrorMessage('');
    setSuccessMessage('');
    setFirstName('');
    setLastName('');
    setPhone('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleGoogleSignIn = async () => {
    console.log('>>> [GoogleSignIn] Button pressed');
    setErrorMessage('');
    setSuccessMessage('');
    setGoogleLoading(true);

    try {
      console.log('>>> [GoogleSignIn] Checking Play Services...');
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      console.log('>>> [GoogleSignIn] Play Services OK, calling signIn()...');
      const response = await GoogleSignin.signIn();
      console.log('>>> [GoogleSignIn] signIn response:', JSON.stringify(response));

      if (response?.type === 'cancelled') {
        console.log('>>> [GoogleSignIn] User cancelled');
        setGoogleLoading(false);
        return;
      }

      const idToken = response?.data?.idToken || response?.idToken;
      console.log('>>> [GoogleSignIn] idToken present:', !!idToken);
      if (!idToken) {
        throw new Error('Could not obtain Google ID token. Please try again.');
      }

      // 1. Authenticate with Firebase using the Google credential
      console.log('>>> [GoogleSignIn] Signing into Firebase Auth...');
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      const authUser = userCredential.user;
      console.log('>>> [GoogleSignIn] Firebase Auth success! UID:', authUser.uid);

      // 2. Check if the Firestore customer profile already exists under users/{uid}
      const userDocRef = doc(db, 'users', authUser.uid);
      const docSnap = await withTimeout(getDoc(userDocRef), 8000);

      if (!docSnap.exists()) {
        // First-time Google user: parse display name and create profile
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
          role: 'customer', // strictly customer
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await withTimeout(setDoc(userDocRef, newProfile), 8000);
        if (onProfileLoaded) {
          onProfileLoaded(newProfile);
        }
      } else {
        // Returning Google user: load existing profile without overwriting
        if (onProfileLoaded) {
          onProfileLoaded(docSnap.data());
        }
      }
    } catch (err) {
      if (
        err.code === statusCodes.SIGN_IN_CANCELLED ||
        err.message?.includes('cancelled')
      ) {
        // User cancelled account chooser
        return;
      }
      setErrorMessage(getFriendlyErrorMessage(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAuth = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    const cleanEmail = email.trim();

    if (mode === 'register') {
      const cleanFirst = firstName.trim();
      const cleanLast = lastName.trim();
      const cleanPhone = phone.trim();

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

        // 3. Immediately sign out the newly created user
        await signOut(auth);

        // 4. Return to Login screen with success message
        if (setIsRegisteringEmail) {
          setIsRegisteringEmail(false);
        }

        setMode('login');
        setFirstName('');
        setLastName('');
        setPhone('');
        setPassword('');
        setConfirmPassword('');
        setErrorMessage('');
        setSuccessMessage('Account created successfully. Please sign in.');
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
    } else {
      // Login mode
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
      } catch (err) {
        setErrorMessage(getFriendlyErrorMessage(err));
      } finally {
        setLoading(false);
      }
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
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.brandTitle}>FairyLux</Text>
          <Text style={styles.cardSubtitle}>
            {mode === 'login'
              ? 'Customer Sign In'
              : 'Create Customer Account'}
          </Text>

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

          {/* Registration-Only Fields */}
          {mode === 'register' ? (
            <>
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
            </>
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
              placeholder={
                mode === 'register'
                  ? 'At least 6 characters'
                  : 'Enter your password'
              }
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

          {/* Confirm Password (Register mode only) */}
          {mode === 'register' ? (
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
          ) : null}

          {/* Email/Password Submit Button */}
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleAuth}
            disabled={isActionDisabled}
            activeOpacity={0.8}>
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Continue with Google (Login mode) */}
          {mode === 'login' ? (
            <>
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
                    <Text style={styles.googleButtonText}>
                      Continue with Google
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </>
          ) : null}

          {/* Mode Switcher */}
          <View style={styles.switchRow}>
            <Text style={styles.switchPrompt}>
              {mode === 'login'
                ? "Don't have an account?"
                : 'Already have an account?'}
            </Text>
            <TouchableOpacity
              onPress={() => switchMode(mode === 'login' ? 'register' : 'login')}
              disabled={isActionDisabled}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.switchLink}>
                {mode === 'login' ? ' Register' : ' Sign In'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function App() {
  const auth = getAuth();
  const db = getFirestore();

  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const isRegisteringEmailRef = useRef(false);

  // Load customer's Firestore profile doc
  const fetchProfile = useCallback(
    async (authUser) => {
      if (!authUser) {
        setUserProfile(null);
        return;
      }

      setLoadingProfile(true);
      try {
        const userDocRef = doc(db, 'users', authUser.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          setUserProfile(docSnap.data());
        } else {
          // If profile does not exist yet (e.g. newly signed-in via Google or fallback)
          let firstName = '';
          let lastName = '';
          if (authUser.displayName) {
            const parts = authUser.displayName.trim().split(/\s+/);
            firstName = parts[0] || '';
            lastName = parts.slice(1).join(' ') || '';
          }

          const defaultProfile = {
            uid: authUser.uid,
            firstName: firstName || 'Valued',
            lastName: lastName || 'Customer',
            email: authUser.email || '',
            phone: authUser.phoneNumber || null,
            photoURL: authUser.photoURL || null,
            role: 'customer',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };

          try {
            await setDoc(userDocRef, defaultProfile);
          } catch (createErr) {
            console.warn('Could not auto-create missing profile:', createErr);
          }
          setUserProfile(defaultProfile);
        }
      } catch (err) {
        console.warn('Error fetching Firestore profile:', err);
        setUserProfile({
          uid: authUser.uid,
          firstName: 'Customer',
          lastName: '',
          email: authUser.email || '',
          phone: null,
          role: 'customer',
          photoURL: authUser.photoURL || null,
        });
      } finally {
        setLoadingProfile(false);
      }
    },
    [db],
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // Prevent transitioning to AuthenticatedScreen during email/password registration
      if (isRegisteringEmailRef.current) {
        return;
      }

      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser);
      } else {
        setUserProfile(null);
      }
      if (initializing) {
        setInitializing(false);
      }
    });

    return unsubscribe;
  }, [auth, fetchProfile, initializing]);

  const handleGlobalLogout = async () => {
    try {
      await GoogleSignin.signOut();
    } catch (e) {
      // Ignore if not signed in with Google
    }
    await signOut(auth);
  };

  if (initializing || (user && loadingProfile && !userProfile)) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <ActivityIndicator size="large" color={colors.gold} />
        <Text style={[styles.loadingText, { color: colors.gold }]}>Loading FairyLux atelier...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      {user ? (
        <NavigationContainer theme={fairyLuxTheme}>
          <NotificationProvider user={user}>
            <RootNavigator
              key={user?.uid}
              user={user}
              profile={userProfile}
              onProfileUpdated={(updated) => setUserProfile(updated)}
              onLogout={handleGlobalLogout}
            />
          </NotificationProvider>
        </NavigationContainer>
      ) : (
        <AuthScreen
          onProfileLoaded={(profile) => {
            setUserProfile(profile);
          }}
          setIsRegisteringEmail={(flag) => {
            isRegisteringEmailRef.current = flag;
          }}
        />
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  authScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#ffffff',
    paddingVertical: 28,
    paddingHorizontal: 22,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    letterSpacing: 0.8,
  },
  cardSubtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
    fontWeight: '500',
  },
  badgeRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  customerBadge: {
    backgroundColor: '#f0fdf4',
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  customerBadgeText: {
    color: '#15803d',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarImage: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 1,
  },
  userNameText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
  },
  userRoleText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 2,
  },
  profileSection: {
    marginBottom: 16,
  },
  editSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
  inlineBadge: {
    backgroundColor: '#eff6ff',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  inlineBadgeText: {
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  uidValue: {
    fontSize: 11,
    color: '#94a3b8',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    maxWidth: '60%',
    textAlign: 'right',
  },
  readOnlyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  readOnlyBadge: {
    fontSize: 11,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  readOnlyInput: {
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    borderColor: '#e2e8f0',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  successContainer: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  successText: {
    color: '#15803d',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  showHideText: {
    fontSize: 12,
    color: '#0284c7',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#0f172a',
  },
  button: {
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#0f172a',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    marginTop: 0,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  googleBadgeText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  googleButtonText: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#0f172a',
    marginTop: 14,
  },
  editButtonText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginTop: 8,
  },
  cancelButtonText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    marginTop: 12,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  switchPrompt: {
    fontSize: 14,
    color: '#64748b',
  },
  switchLink: {
    fontSize: 14,
    color: '#0284c7',
    fontWeight: '700',
  },
});

export default App;
