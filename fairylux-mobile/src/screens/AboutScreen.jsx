import React from 'react';
import { FairyLuxIcon } from '../components/FairyLuxIcon';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { Header } from '../components/Header';

export function AboutScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="About FairyLux" navigation={navigation} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Brand Banner */}
        <View style={styles.bannerContainer}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1000&q=80',
            }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerBrand}>FAIRYLUX</Text>
            <Text style={styles.bannerTagline}>LUXURY GOWN BOUTIQUE</Text>
          </View>
        </View>

        {/* Brand Story */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Story</Text>
          <Text style={styles.bodyText}>
            FairyLux was founded on the philosophy that every celebratory milestone deserves an enchanting, timeless creation. Specializing in designer wedding silhouettes, magnificent evening gowns, prom showcases, and gala attire, our collections merge premium craftsmanship with modern elegance.
          </Text>
        </View>

        {/* Pillars */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Craftsmanship Pillars</Text>
          <View style={styles.pillarCard}>
            <View style={styles.pillarIconView}>
              <FairyLuxIcon name="scissors" size={20} color={colors.brand} />
            </View>
            <View style={styles.pillarContent}>
              <Text style={styles.pillarTitle}>Artisanal Hand-Embroidery</Text>
              <Text style={styles.pillarDesc}>
                Each Swarovski crystal, glass bead, and pearl applique is delicately hand-sewn by master artisans with over 150 hours of meticulous work.
              </Text>
            </View>
          </View>

          <View style={styles.pillarCard}>
            <View style={styles.pillarIconView}>
              <FairyLuxIcon name="leaf" size={20} color={colors.brand} />
            </View>
            <View style={styles.pillarContent}>
              <Text style={styles.pillarTitle}>Ethically Sourced European Silks</Text>
              <Text style={styles.pillarDesc}>
                We partner with heritage mills in Lyon and Como to procure premium mikado, duchess satin, and Chantilly laces.
              </Text>
            </View>
          </View>

          <View style={styles.pillarCard}>
            <View style={styles.pillarIconView}>
              <FairyLuxIcon name="sparkle" size={20} color={colors.brand} />
            </View>
            <View style={styles.pillarContent}>
              <Text style={styles.pillarTitle}>Tailored Silhouette Design</Text>
              <Text style={styles.pillarDesc}>
                Internal boning, structured bustiers, and custom draping tailored to accentuate natural poise and grace.
              </Text>
            </View>
          </View>
        </View>

        {/* Boutique Location */}
        <View style={styles.locationCard}>
          <Text style={styles.locationTitle}>Flagship Boutique & Showroom</Text>
          <Text style={styles.locationAddress}>
            FairyLux Flagship Boutique{'\n'}
            5th Avenue, Bonifacio High Street Central{'\n'}
            Bonifacio Global City, Taguig, Philippines
          </Text>
          <Text style={styles.locationHours}>
            Appointments Available Daily: 10:00 AM – 8:00 PM
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  bannerContainer: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 5, 18, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  bannerBrand: {
    fontSize: 28,
    fontFamily: fonts.bold,
    color: '#ffffff',
    letterSpacing: 5,
  },
  bannerTagline: {
    fontSize: 10,
    fontFamily: fonts.medium,
    color: colors.champagne,
    letterSpacing: 2.5,
    marginTop: 6,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  bodyText: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  pillarCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  pillarIconView: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.brandLight,
    borderWidth: 1,
    borderColor: colors.brandBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
    flexShrink: 0,
  },
  pillarContent: {
    flex: 1,
  },
  pillarTitle: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.brand,
    marginBottom: 4,
  },
  pillarDesc: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  locationCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.brandBorder,
    marginTop: 4,
  },
  locationTitle: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.brand,
    marginBottom: 10,
  },
  locationAddress: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  locationHours: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
});
