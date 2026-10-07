import { statusCodes } from '@react-native-google-signin/google-signin';

export const GOOGLE_WEB_CLIENT_ID =
  '80924638878-40qi0gqetestqi2dbvverji4n62on9a0.apps.googleusercontent.com';

export function getFriendlyErrorMessage(error) {
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

export const withTimeout = (
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
