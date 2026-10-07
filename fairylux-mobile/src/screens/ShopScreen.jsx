import React, { useState } from 'react';
import { FairyLuxIcon } from '../components/FairyLuxIcon';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Header from '../components/Header';
import ShopTopTabNavigator from '../navigation/ShopTopTabNavigator';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export default function ShopScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={styles.container}>
      <Header title="FairyLux" subtitle="LUXURY GOWN BOUTIQUE" />

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <FairyLuxIcon name="search" size={16} color={colors.textMuted} style={styles.searchIconView} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search gowns, silhouettes, fabrics..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <FairyLuxIcon name="close" size={14} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Top Tab Navigator containing All, Wedding, Prom, Evening, Bridesmaid, Ball */}
      <View style={styles.tabWrapper}>
        <ShopTopTabNavigator searchQuery={searchQuery} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchWrapper: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIconView: {
    marginRight: 8,
  },
  searchInput: {
    fontFamily: fonts.regular,
    flex: 1,
    height: 42,
    fontSize: 13,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  tabWrapper: {
    flex: 1,
  },
});

export { ShopScreen };
