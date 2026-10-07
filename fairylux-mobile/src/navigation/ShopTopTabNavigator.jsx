import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { FairyLuxIcon } from '../components/FairyLuxIcon';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { fetchProducts } from '../services/api';
import GownCard from '../components/GownCard';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export const ShopSearchContext = createContext('');

const TopTab = createMaterialTopTabNavigator();

export const CATEGORY_TABS = [
  { id: 'all', name: 'All', label: 'All Gowns', apiCategory: '' },
  { id: 'wedding', name: 'Wedding', label: 'Wedding', apiCategory: 'Wedding Gowns' },
  { id: 'prom', name: 'Prom', label: 'Prom', apiCategory: 'Prom Gowns' },
  { id: 'evening', name: 'Evening', label: 'Evening', apiCategory: 'Evening Gowns' },
  { id: 'bridesmaid', name: 'Bridesmaid', label: 'Bridesmaid', apiCategory: 'Bridesmaid Gowns' },
  { id: 'ball', name: 'Ball', label: 'Ball', apiCategory: 'Ball Gowns' },
];

function CategoryGownList({ route }) {
  const searchQuery = useContext(ShopSearchContext);
  const apiCategory = route.params?.apiCategory || '';
  const tabName = route.params?.tabName || route.name || 'Gowns';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const loadProducts = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setErrorMessage(null);

    try {
      const params = { per_page: 50 };
      if (apiCategory) {
        params.category = apiCategory;
      }
      if (searchQuery && searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const result = await fetchProducts(params);
      setProducts(result.data || []);
    } catch (err) {
      setErrorMessage(err.message || 'Unable to load the gown collection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [apiCategory, searchQuery]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.gold} />
        <Text style={styles.loadingText}>Fetching {tabName} catalog...</Text>
      </View>
    );
  }

  if (errorMessage && products.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <FairyLuxIcon name="warning" size={36} color={colors.gold} style={{ marginBottom: 10 }} />
        <Text style={styles.errorTitle}>Catalog Connection Failed</Text>
        <Text style={styles.errorText}>{errorMessage}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadProducts()}
          activeOpacity={0.8}>
          <Text style={styles.retryButtonText}>Retry Connection</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.listContainer}>
      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadProducts(true)}
            colors={[colors.gold]}
            tintColor={colors.gold}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.cardCol}>
            <GownCard gown={item} />
          </View>
        )}
        ListHeaderComponent={
          <View style={styles.headerCountRow}>
            <Text style={styles.countText}>
              Showing {products.length} {products.length === 1 ? 'Gown' : 'Gowns'}
              {searchQuery ? ` matching "${searchQuery}"` : ''}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FairyLuxIcon name="sparkle" size={36} color={colors.gold} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No matching gowns found' : 'No gowns currently in this collection'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? 'Try adjusting your search terms or exploring other silhouettes.'
                : 'New handcrafted gowns are being added to our collection soon.'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

export default function ShopTopTabNavigator({ searchQuery = '' }) {
  return (
    <ShopSearchContext.Provider value={searchQuery}>
      <TopTab.Navigator
        screenOptions={{
          tabBarScrollEnabled: true,
          tabBarItemStyle: {
            width: 'auto',
            paddingHorizontal: 16,
            minHeight: 44,
          },
          tabBarLabelStyle: {
            fontFamily: fonts.semiBold,
            fontSize: 13,
            fontWeight: '600',
            textTransform: 'none',
            letterSpacing: 0.3,
          },
          tabBarActiveTintColor: colors.brand,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarIndicatorStyle: {
            backgroundColor: colors.brand,
            height: 3,
            borderRadius: 2,
          },
          tabBarStyle: {
            backgroundColor: colors.surface,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          },
        }}>
        {CATEGORY_TABS.map((cat) => (
          <TopTab.Screen
            key={cat.id}
            name={cat.name}
            component={CategoryGownList}
            initialParams={{
              apiCategory: cat.apiCategory,
              tabName: cat.label,
            }}
            options={{
              tabBarLabel: cat.name,
            }}
          />
        ))}
      </TopTab.Navigator>
    </ShopSearchContext.Provider>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 24,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  cardCol: {
    width: '48.5%',
  },
  headerCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 10,
    marginBottom: 4,
  },
  countText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  loadingText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.brand,
    fontWeight: '500',
    marginTop: 12,
  },

  errorTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  errorText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 19,
  },
  retryButton: {
    backgroundColor: colors.brand,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 12,
    shadowColor: colors.brandDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  retryButtonText: {
    fontFamily: fonts.bold,
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },

  emptyTitle: {
    fontFamily: fonts.bold,
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
