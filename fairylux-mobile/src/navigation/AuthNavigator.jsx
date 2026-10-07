import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { TermsScreen } from '../screens/TermsScreen';
import { PrivacyPolicyScreen } from '../screens/PrivacyPolicyScreen';

const Stack = createNativeStackNavigator();

export function AuthNavigator({ onProfileLoaded, setIsRegisteringEmail }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login">
        {(props) => (
          <LoginScreen
            {...props}
            onProfileLoaded={onProfileLoaded}
            setIsRegisteringEmail={setIsRegisteringEmail}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Register">
        {(props) => (
          <RegisterScreen
            {...props}
            setIsRegisteringEmail={setIsRegisteringEmail}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="Terms & Conditions" component={TermsScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="Privacy Policy" component={PrivacyPolicyScreen} />
    </Stack.Navigator>
  );
}

export default AuthNavigator;
