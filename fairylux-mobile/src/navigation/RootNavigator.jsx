import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AppDrawerNavigator } from './AppDrawerNavigator';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { OrderDetailsScreen } from '../screens/OrderDetailsScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { CompleteProfileScreen } from '../screens/CompleteProfileScreen';
import { TermsScreen } from '../screens/TermsScreen';
import { PrivacyPolicyScreen } from '../screens/PrivacyPolicyScreen';
import { WishlistScreen } from '../screens/WishlistScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { AddressesScreen } from '../screens/AddressesScreen';
import { SupportScreen } from '../screens/SupportScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';

const Stack = createNativeStackNavigator();

export function RootNavigator({ user, profile, onProfileUpdated, onLogout }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="DrawerRoot">
        {(props) => (
          <AppDrawerNavigator
            {...props}
            user={user}
            profile={profile}
            onLogout={onLogout}
          />
        )}
      </Stack.Screen>

      {/* Product Details */}
      <Stack.Screen
        name="ProductDetails"
        component={ProductDetailsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Product Details"
        component={ProductDetailsScreen}
        options={{ animation: 'slide_from_right' }}
      />

      {/* Checkout */}
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ animation: 'slide_from_bottom' }}
      />

      {/* Order Details */}
      <Stack.Screen
        name="OrderDetails"
        component={OrderDetailsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Order Details"
        component={OrderDetailsScreen}
        options={{ animation: 'slide_from_right' }}
      />

      {/* Edit Profile */}
      <Stack.Screen
        name="EditProfile"
        options={{ animation: 'slide_from_bottom' }}
      >
        {(props) => (
          <EditProfileScreen
            {...props}
            route={{
              ...props.route,
              params: {
                user,
                profile,
                onProfileUpdated,
                ...props.route?.params,
              },
            }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="Edit Profile"
        options={{ animation: 'slide_from_bottom' }}
      >
        {(props) => (
          <EditProfileScreen
            {...props}
            route={{
              ...props.route,
              params: {
                user,
                profile,
                onProfileUpdated,
                ...props.route?.params,
              },
            }}
          />
        )}
      </Stack.Screen>

      {/* Complete Profile */}
      <Stack.Screen
        name="CompleteProfile"
        options={{ animation: 'slide_from_bottom' }}
      >
        {(props) => (
          <CompleteProfileScreen
            {...props}
            route={{
              ...props.route,
              params: {
                user,
                profile,
                onProfileUpdated,
                ...props.route?.params,
              },
            }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="Complete Profile"
        options={{ animation: 'slide_from_bottom' }}
      >
        {(props) => (
          <CompleteProfileScreen
            {...props}
            route={{
              ...props.route,
              params: {
                user,
                profile,
                onProfileUpdated,
                ...props.route?.params,
              },
            }}
          />
        )}
      </Stack.Screen>

      {/* Direct Stack access for Drawer / Concierge Screens */}
      <Stack.Screen name="Wishlist" component={WishlistScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Addresses" component={AddressesScreen} />
      <Stack.Screen name="My Addresses" component={AddressesScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="Help & Support" component={SupportScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="About FairyLux" component={AboutScreen} />

      {/* Legal & Policy Screens */}
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="Terms & Conditions" component={TermsScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="Privacy Policy" component={PrivacyPolicyScreen} />

      {/* Auth routes reachable in stack if navigated */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

export default RootNavigator;
