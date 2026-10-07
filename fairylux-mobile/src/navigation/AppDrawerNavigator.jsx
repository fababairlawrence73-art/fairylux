import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { BottomTabNavigator } from './BottomTabNavigator';
import { WishlistScreen } from '../screens/WishlistScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { AddressesScreen } from '../screens/AddressesScreen';
import { SupportScreen } from '../screens/SupportScreen';
import { AboutScreen } from '../screens/AboutScreen';
import CustomDrawerContent from '../components/CustomDrawerContent';
import { colors } from '../theme/colors';

const Drawer = createDrawerNavigator();

export function AppDrawerNavigator({ user, profile, onLogout }) {
  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <CustomDrawerContent
          {...props}
          user={user}
          userProfile={profile}
        />
      )}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: colors.surface,
          width: 290,
        },
        drawerType: 'slide',
        overlayColor: 'rgba(0, 0, 0, 0.7)',
      }}
    >
      <Drawer.Screen name="MainTabs">
        {(props) => (
          <BottomTabNavigator
            {...props}
            user={user}
            profile={profile}
            onLogout={onLogout}
          />
        )}
      </Drawer.Screen>
      <Drawer.Screen name="Wishlist" component={WishlistScreen} />
      <Drawer.Screen name="Notifications" component={NotificationsScreen} />
      <Drawer.Screen name="Addresses" component={AddressesScreen} />
      <Drawer.Screen name="My Addresses" component={AddressesScreen} />
      <Drawer.Screen name="Support" component={SupportScreen} />
      <Drawer.Screen name="Help & Support" component={SupportScreen} />
      <Drawer.Screen name="About" component={AboutScreen} />
      <Drawer.Screen name="About FairyLux" component={AboutScreen} />
    </Drawer.Navigator>
  );
}
