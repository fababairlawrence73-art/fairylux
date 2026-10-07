import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

import { HomeScreen } from '../screens/HomeScreen';
import { ShopScreen } from '../screens/ShopScreen';
import { CartScreen } from '../screens/CartScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { FairyLuxIcon } from '../components/FairyLuxIcon';

const Tab = createBottomTabNavigator();

export function BottomTabNavigator({ user, profile, onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <FairyLuxIcon name="home" size={20} color={color} />
            </View>
          ),
        }}
      >
        {(props) => (
          <HomeScreen
            {...props}
            userProfile={profile}
            user={user}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Shop"
        component={ShopScreen}
        options={{
          tabBarLabel: 'Shop',
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <FairyLuxIcon name="shop" size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: 'Cart',
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <FairyLuxIcon name="bag" size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarLabel: 'Orders',
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <FairyLuxIcon name="orders" size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <FairyLuxIcon name="user" size={20} color={color} />
            </View>
          ),
        }}
      >
        {(props) => (
          <ProfileScreen
            {...props}
            user={user}
            profile={profile}
            onLogout={onLogout}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 62,
    paddingBottom: 7,
    paddingTop: 7,
    elevation: 8,
    shadowColor: colors.brandDark,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  tabLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 10.5,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BottomTabNavigator;
