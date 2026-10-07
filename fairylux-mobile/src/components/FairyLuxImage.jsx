import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

/**
 * FairyLuxImage
 * Robust image loader with graceful, elegant fallback for null or failed images.
 */
export function FairyLuxImage({
  source,
  style,
  resizeMode = 'cover',
  placeholderText = 'FairyLux',
  showEmblem = true,
}) {
  const [hasError, setHasError] = useState(false);

  const uri = typeof source === 'object' && source !== null ? source.uri : source;
  const isValidUri = uri && typeof uri === 'string' && uri.trim().length > 0;

  if (!isValidUri || hasError) {
    return (
      <View style={[styles.placeholderContainer, style]}>
        {showEmblem && (
          <View style={styles.emblemCircle}>
            <Text style={styles.emblemText}>FL</Text>
          </View>
        )}
        <Text style={styles.placeholderLabel} numberOfLines={1}>
          {placeholderText}
        </Text>
        <Text style={styles.placeholderSub}>Luxury Gown</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      resizeMode={resizeMode}
      onError={() => setHasError(true)}
    />
  );
}

const styles = StyleSheet.create({
  placeholderContainer: {
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  emblemCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.goldBorder,
    marginBottom: 6,
  },
  emblemText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.gold,
    letterSpacing: 1.5,
  },
  placeholderLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  placeholderSub: {
    fontSize: 9,
    color: colors.gold,
    letterSpacing: 0.5,
    marginTop: 2,
    textTransform: 'uppercase',
  },
});

export default FairyLuxImage;
