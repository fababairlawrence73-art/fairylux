import React, { useCallback, useEffect, useState } from 'react';
import { FairyLuxIcon } from '../components/FairyLuxIcon';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import GownCard from '../components/GownCard';
import { fetchProducts } from '../services/api';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

const HOME_CATEGORIES = [
  { id: 'wedding', name: 'Wedding' },
  { id: 'prom', name: 'Prom' },
  { id: 'evening', name: 'Evening' },
  { id: 'bridesmaid', name: 'Bridesmaid' },
  { id: 'ball', name: 'Ball' },
];

export default function HomeScreen({ userProfile, user }) {
  const navigation = useNavigation();

  const [featuredGowns, setFeaturedGowns] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const firstName =
    userProfile?.firstName?.trim() ||
    (user?.displayName ? user.displayName.split(' ')[0] : 'Valued Customer');

  const loadHomeCatalog = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [featuredRes, newArrivalsRes] = await Promise.all([
        fetchProducts({ featured: 1, per_page: 10 }),
        fetchProducts({ sort: 'newest', per_page: 10 }),
      ]);
      const featuredItems = (featuredRes.data || []).filter((g) => Boolean(g.is_featured));
      setFeaturedGowns(featuredItems);
      setNewArrivals(newArrivalsRes.data || []);
    } catch (e) {
      console.warn('Failed to load home catalog:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHomeCatalog();
  }, [loadHomeCatalog]);

  return (
    <View style={styles.container}>
      <Header title="FairyLux" subtitle="LUXURY GOWN BOUTIQUE" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadHomeCatalog(true)}
            colors={[colors.brand]}
            tintColor={colors.brand}
          />
        }>
        {/* 1. Welcome Greeting */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeSubtitle}>WELCOME TO FAIRYLUX</Text>
          <Text style={styles.welcomeTitle}>
            Welcome back, <Text style={styles.welcomeName}>{firstName}</Text>
          </Text>
          <Text style={styles.welcomeDesc}>
            Discover beautifully crafted gowns for your most memorable moments.
          </Text>
        </View>

        {/* 2. Search */}
        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.88}
          onPress={() => navigation.navigate('Shop')}>
          <FairyLuxIcon name="search" size={16} color={colors.textMuted} style={styles.searchIconView} />
          <Text style={styles.searchPlaceholder}>
            Search gowns, silhouettes, fabrics...
          </Text>
        </TouchableOpacity>

        {/* 3. Hero Banner */}
        <View style={styles.heroBanner}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            <View style={styles.heroTag}>
              <Text style={styles.heroTagText}>EXCLUSIVE COLLECTION 2026</Text>
            </View>
            <Text style={styles.heroTitle}>Find Your Perfect Gown</Text>
            <Text style={styles.heroSubtitle}>
              Handcrafted bridal and evening gowns for your memorable occasions.
            </Text>
            <TouchableOpacity
              style={styles.heroButton}
              onPress={() => navigation.navigate('Shop')}
              activeOpacity={0.85}>
              <Text style={styles.heroButtonText}>Explore Collection ›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. Shop by Category */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shop by Category</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Shop')}>
              <Text style={styles.seeAllText}>View All ›</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesRow}>
            {HOME_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryPill}
                onPress={() => navigation.navigate('Shop', { screen: cat.name })}
                activeOpacity={0.78}>
                <Text style={styles.categoryPillText}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 5. Featured Gowns */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTag}>FEATURED SELECTION</Text>
              <Text style={styles.sectionTitle}>Featured Gowns</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Shop')}>
              <Text style={styles.seeAllText}>See All ›</Text>
            </TouchableOpacity>
          </View>

          {loading && featuredGowns.length === 0 ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.brand} />
              <Text style={styles.loadingRowText}>Loading featured gowns...</Text>
            </View>
          ) : (
            <FlatList
              horizontal
              data={featuredGowns}
              keyExtractor={(item) => String(item.id)}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              renderItem={({ item }) => (
                <View style={styles.featuredCardWrapper}>
                  <GownCard gown={item} showWishlist={false} />
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyFeatured}>
                  <Text style={styles.emptyText}>No featured gowns found</Text>
                </View>
              }
            />
          )}
        </View>

        {/* 6. New Arrivals */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTag}>FRESH FROM THE RUNWAY</Text>
              <Text style={styles.sectionTitle}>New Arrivals</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Shop')}>
              <Text style={styles.seeAllText}>Shop All ›</Text>
            </TouchableOpacity>
          </View>

          {loading && newArrivals.length === 0 ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.brand} />
              <Text style={styles.loadingRowText}>Loading new arrivals...</Text>
            </View>
          ) : (
            <FlatList
              horizontal
              data={newArrivals}
              keyExtractor={(item) => String(item.id)}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              renderItem={({ item }) => (
                <View style={styles.featuredCardWrapper}>
                  <GownCard gown={item} showWishlist={false} />
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyFeatured}>
                  <Text style={styles.emptyText}>No new arrivals found</Text>
                </View>
              }
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 36,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  welcomeSubtitle: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.brand,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  welcomeTitle: {
    fontFamily: fonts.bold,
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 29,
  },
  welcomeName: {
    color: colors.brand,
  },
  welcomeDesc: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.brandDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  searchIconView: {
    marginRight: 10,
  },
  searchPlaceholder: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  heroBanner: {
    marginHorizontal: 20,
    height: 205,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: 8,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.46)',
    padding: 18,
    justifyContent: 'flex-end',
  },
  heroTag: {
    backgroundColor: colors.brandDark,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  heroTagText: {
    fontFamily: fonts.bold,
    color: colors.goldLight,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontFamily: fonts.bold,
    fontSize: 19,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: '#f1f5f9',
    lineHeight: 16,
    marginBottom: 12,
  },
  heroButton: {
    backgroundColor: colors.brand,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignSelf: 'flex-start',
    shadowColor: colors.brandDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  heroButtonText: {
    fontFamily: fonts.bold,
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  sectionContainer: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTag: {
    fontFamily: fonts.bold,
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.brand,
    letterSpacing: 1,
    marginBottom: 2,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 17.5,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  seeAllText: {
    fontFamily: fonts.semiBold,
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.brand,
  },
  categoriesRow: {
    paddingHorizontal: 16,
  },
  categoryPill: {
    backgroundColor: colors.surface,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: 4,
    shadowColor: colors.brandDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  categoryPillText: {
    fontFamily: fonts.semiBold,
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  horizontalList: {
    paddingLeft: 20,
    paddingRight: 6,
  },
  featuredCardWrapper: {
    width: 175,
    marginRight: 14,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 10,
  },
  loadingRowText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  emptyFeatured: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
});

export { HomeScreen };
