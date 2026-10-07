import React from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * FairyLuxIcon
 * Pure React Native vector icons built using precise geometric stroke & shape primitives.
 * Zero external native dependencies, hardware accelerated, 100% theme consistent.
 */
export function FairyLuxIcon({ name, size = 20, color = '#0f172a', style }) {
  const stroke = Math.max(1.5, Math.round(size / 11));
  const s = size;

  const renderIcon = () => {
    switch (name) {
      // ─── Navigation & Core ──────────────────────────────────────────────────
      case 'home':
        return (
          <View style={[styles.center, { width: s, height: s }]}>
            {/* Roof Peak */}
            <View
              style={{
                width: s * 0.58,
                height: s * 0.58,
                borderTopWidth: stroke,
                borderLeftWidth: stroke,
                borderColor: color,
                transform: [{ rotate: '45deg' }],
                position: 'absolute',
                top: s * 0.12,
              }}
            />
            {/* House Body */}
            <View
              style={{
                width: s * 0.62,
                height: s * 0.44,
                borderLeftWidth: stroke,
                borderRightWidth: stroke,
                borderBottomWidth: stroke,
                borderColor: color,
                position: 'absolute',
                bottom: s * 0.12,
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}>
              {/* Door */}
              <View
                style={{
                  width: s * 0.22,
                  height: s * 0.24,
                  borderTopWidth: stroke,
                  borderLeftWidth: stroke,
                  borderRightWidth: stroke,
                  borderColor: color,
                }}
              />
            </View>
          </View>
        );

      case 'shop':
      case 'sparkle':
        return (
          <View style={[styles.center, { width: s, height: s }]}>
            {/* 4-point Diamond Star */}
            <View
              style={{
                width: s * 0.48,
                height: s * 0.48,
                backgroundColor: color,
                borderRadius: s * 0.08,
                transform: [{ rotate: '45deg' }],
              }}
            />
            {/* Cutout Inner Accent */}
            <View
              style={{
                position: 'absolute',
                width: s * 0.18,
                height: s * 0.18,
                borderRadius: s * 0.09,
                backgroundColor: '#ffffff',
              }}
            />
          </View>
        );

      case 'bag':
      case 'cart':
        return (
          <View style={[styles.center, { width: s, height: s }]}>
            {/* Handle Arch */}
            <View
              style={{
                width: s * 0.38,
                height: s * 0.38,
                borderTopWidth: stroke,
                borderLeftWidth: stroke,
                borderRightWidth: stroke,
                borderColor: color,
                borderTopLeftRadius: s * 0.22,
                borderTopRightRadius: s * 0.22,
                position: 'absolute',
                top: s * 0.08,
              }}
            />
            {/* Bag Body */}
            <View
              style={{
                width: s * 0.68,
                height: s * 0.58,
                borderWidth: stroke,
                borderColor: color,
                borderRadius: s * 0.1,
                position: 'absolute',
                bottom: s * 0.1,
              }}
            />
          </View>
        );

      case 'orders':
      case 'package':
        return (
          <View style={[styles.center, { width: s, height: s }]}>
            {/* Outer Box */}
            <View
              style={{
                width: s * 0.72,
                height: s * 0.68,
                borderWidth: stroke,
                borderColor: color,
                borderRadius: s * 0.1,
                alignItems: 'center',
              }}>
              {/* Box Top Flap Line */}
              <View
                style={{
                  width: '100%',
                  height: stroke,
                  backgroundColor: color,
                  position: 'absolute',
                  top: s * 0.2,
                }}
              />
              {/* Box Center Vertical Line */}
              <View
                style={{
                  width: stroke,
                  height: '100%',
                  backgroundColor: color,
                }}
              />
            </View>
          </View>
        );

      case 'user':
      case 'profile':
        return (
          <View style={[styles.center, { width: s, height: s }]}>
            {/* Head */}
            <View
              style={{
                width: s * 0.36,
                height: s * 0.36,
                borderRadius: (s * 0.36) / 2,
                borderWidth: stroke,
                borderColor: color,
                position: 'absolute',
                top: s * 0.12,
              }}
            />
            {/* Shoulder Arc */}
            <View
              style={{
                width: s * 0.68,
                height: s * 0.36,
                borderTopLeftRadius: s * 0.34,
                borderTopRightRadius: s * 0.34,
                borderTopWidth: stroke,
                borderLeftWidth: stroke,
                borderRightWidth: stroke,
                borderColor: color,
                position: 'absolute',
                bottom: s * 0.1,
              }}
            />
          </View>
        );

      case 'search':
        return (
          <View style={[styles.center, { width: s, height: s }]}>
            {/* Magnifying Glass Lens */}
            <View
              style={{
                width: s * 0.54,
                height: s * 0.54,
                borderRadius: (s * 0.54) / 2,
                borderWidth: stroke,
                borderColor: color,
                position: 'absolute',
                top: s * 0.1,
                left: s * 0.1,
              }}
            />
            {/* Handle */}
            <View
              style={{
                width: s * 0.32,
                height: stroke + 0.5,
                backgroundColor: color,
                borderRadius: stroke,
                position: 'absolute',
                bottom: s * 0.16,
                right: s * 0.12,
                transform: [{ rotate: '45deg' }],
              }}
            />
          </View>
        );

      // ─── Wishlist & Favorites ───────────────────────────────────────────────
      case 'heart':
      case 'heart-solid':
        return (
          <View style={[styles.center, { width: s, height: s }]}>
            <View style={{ width: s * 0.72, height: s * 0.72, position: 'relative' }}>
              {/* Left Lobe */}
              <View
                style={{
                  position: 'absolute',
                  width: s * 0.44,
                  height: s * 0.44,
                  borderRadius: (s * 0.44) / 2,
                  backgroundColor: color,
                  left: 0,
                  top: 0,
                }}
              />
              {/* Right Lobe */}
              <View
                style={{
                  position: 'absolute',
                  width: s * 0.44,
                  height: s * 0.44,
                  borderRadius: (s * 0.44) / 2,
                  backgroundColor: color,
                  right: 0,
                  top: 0,
                }}
              />
              {/* Bottom V */}
              <View
                style={{
                  position: 'absolute',
                  width: s * 0.48,
                  height: s * 0.48,
                  backgroundColor: color,
                  bottom: s * 0.08,
                  left: s * 0.12,
                  transform: [{ rotate: '45deg' }],
                }}
              />
            </View>
          </View>
        );

      case 'heart-outline':
        return (
          <View style={[styles.center, { width: s, height: s }]}>
            <View style={{ width: s * 0.72, height: s * 0.72, position: 'relative' }}>
              {/* Left Outline Arch */}
              <View
                style={{
                  position: 'absolute',
                  width: s * 0.44,
                  height: s * 0.44,
                  borderRadius: (s * 0.44) / 2,
                  borderWidth: stroke,
                  borderBottomColor: 'transparent',
                  borderRightColor: 'transparent',
                  borderColor: color,
                  left: 0,
                  top: 0,
                  transform: [{ rotate: '-45deg' }],
                }}
              />
              {/* Right Outline Arch */}
              <View
                style={{
                  position: 'absolute',
                  width: s * 0.44,
                  height: s * 0.44,
                  borderRadius: (s * 0.44) / 2,
                  borderWidth: stroke,
                  borderBottomColor: 'transparent',
                  borderLeftColor: 'transparent',
                  borderColor: color,
                  right: 0,
                  top: 0,
                  transform: [{ rotate: '45deg' }],
                }}
              />
              {/* Bottom Point */}
              <View
                style={{
                  position: 'absolute',
                  width: s * 0.44,
                  height: s * 0.44,
                  borderBottomWidth: stroke,
                  borderRightWidth: stroke,
                  borderColor: color,
                  bottom: s * 0.06,
                  left: s * 0.14,
                  transform: [{ rotate: '45deg' }],
                }}
              />
            </View>
          </View>
        );

      // ─── Alerts, Notifications & Communication ──────────────────────────────
      case 'bell':
        return (
          <View style={[styles.center, { width: s, height: s }]}>
            {/* Bell Dome */}
            <View
              style={{
                width: s * 0.54,
                height: s * 0.52,
                borderTopLeftRadius: s * 0.27,
                borderTopRightRadius: s * 0.27,
                borderWidth: stroke,
                borderColor: color,
                position: 'absolute',
                top: s * 0.14,
              }}
            />
            {/* Rim Base Line */}
            <View
              style={{
                width: s * 0.72,
                height: stroke,
                backgroundColor: color,
                borderRadius: stroke / 2,
                position: 'absolute',
                bottom: s * 0.24,
              }}
            />
            {/* Clapper Dot */}
            <View
              style={{
                width: s * 0.18,
                height: s * 0.14,
                backgroundColor: color,
                borderRadius: s * 0.08,
                position: 'absolute',
                bottom: s * 0.1,
              }}
            />
          </View>
        );

      case 'pin':
      case 'location':
        return (
          <View style={[styles.center, { width: s, height: s }]}>
            {/* Pin Head */}
            <View
              style={{
                width: s * 0.52,
                height: s * 0.52,
                borderRadius: (s * 0.52) / 2,
                borderWidth: stroke,
                borderColor: color,
                position: 'absolute',
                top: s * 0.08,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <View
                style={{
                  width: s * 0.16,
                  height: s * 0.16,
                  borderRadius: (s * 0.16) / 2,
                  backgroundColor: color,
                }}
              />
            </View>
            {/* Downward Point */}
            <View
              style={{
                width: s * 0.28,
                height: s * 0.28,
                borderRightWidth: stroke,
                borderBottomWidth: stroke,
                borderColor: color,
                transform: [{ rotate: '45deg' }],
                position: 'absolute',
                bottom: s * 0.14,
              }}
            />
          </View>
        );

      case 'phone':
        return (
          <View style={[styles.center, { width: s, height: s }]}>
            <View
              style={{
                width: s * 0.44,
                height: s * 0.68,
                borderRadius: s * 0.1,
                borderWidth: stroke,
                borderColor: color,
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: s * 0.06,
              }}>
              {/* Speaker bar */}
              <View style={{ width: s * 0.16, height: stroke - 0.5, backgroundColor: color, borderRadius: 1 }} />
              {/* Home button circle */}
              <View style={{ width: s * 0.12, height: s * 0.12, borderRadius: s * 0.06, borderWidth: 1, borderColor: color }} />
            </View>
          </View>
        );

      case 'mail':
      case 'email':
        return (
          <View style={[styles.center, { width: s, height: s }]}>
            <View
              style={{
                width: s * 0.74,
                height: s * 0.54,
                borderWidth: stroke,
                borderColor: color,
                borderRadius: s * 0.08,
                overflow: 'hidden',
                alignItems: 'center',
              }}>
              {/* Inner V fold line */}
              <View
                style={{
                  width: s * 0.48,
                  height: s * 0.48,
                  borderLeftWidth: stroke,
                  borderBottomWidth: stroke,
                  borderColor: color,
                  transform: [{ rotate: '-45deg' }],
                  position: 'absolute',
                  top: -s * 0.26,
                }}
              />
            </View>
          </View>
        );

      case 'chat':
      case 'support':
        return (
          <View style={[styles.center, { width: s, height: s }]}>
            <View
              style={{
                width: s * 0.72,
                height: s * 0.52,
                borderRadius: s * 0.14,
                borderWidth: stroke,
                borderColor: color,
                position: 'relative',
              }}
            />
            {/* Bubble Tail */}
            <View
              style={{
                width: s * 0.2,
                height: s * 0.2,
                borderRightWidth: stroke,
                borderBottomWidth: stroke,
                borderColor: color,
                transform: [{ rotate: '45deg' }],
                position: 'absolute',
                bottom: s * 0.16,
                left: s * 0.26,
                backgroundColor: '#ffffff',
              }}
            />
          </View>
        );

      // ─── Actions & Controls ─────────────────────────────────────────────────
      case 'check':
        return (
          <View style={[styles.center, { width: s, height: s }]}>
            <View
              style={{
                width: s * 0.32,
                height: s * 0.56,
                borderRightWidth: stroke + 0.5,
                borderBottomWidth: stroke + 0.5,
                borderColor: color,
                transform: [{ rotate: '45deg' }],
                marginBottom: s * 0.12,
              }}
            />
          </View>
        );

      case 'close':
      case 'remove':
        return (
          <View style={[styles.center, { width: s, height: s }]}>
            <View
              style={{
                width: s * 0.62,
                height: stroke + 0.5,
                backgroundColor: color,
                borderRadius: stroke / 2,
                transform: [{ rotate: '45deg' }],
                position: 'absolute',
              }}
            />
            <View
              style={{
                width: s * 0.62,
                height: stroke + 0.5,
                backgroundColor: color,
                borderRadius: stroke / 2,
                transform: [{ rotate: '-45deg' }],
                position: 'absolute',
              }}
            />
          </View>
        );

      case 'warning':
      case 'alert':
        return (
          <View style={[styles.center, { width: s, height: s }]}>
            <View
              style={{
                width: s * 0.68,
                height: s * 0.68,
                borderTopWidth: stroke,
                borderLeftWidth: stroke,
                borderColor: color,
                borderRadius: s * 0.08,
                transform: [{ rotate: '45deg' }],
                position: 'absolute',
                top: s * 0.18,
              }}
            />
            {/* Warning exclamation mark */}
            <View
              style={{
                width: stroke + 0.5,
                height: s * 0.22,
                backgroundColor: color,
                position: 'absolute',
                top: s * 0.32,
                borderRadius: 1,
              }}
            />
            <View
              style={{
                width: stroke + 0.5,
                height: stroke + 0.5,
                backgroundColor: color,
                position: 'absolute',
                bottom: s * 0.28,
                borderRadius: (stroke + 0.5) / 2,
              }}
            />
          </View>
        );

      case 'info':
        return (
          <View style={[styles.center, { width: s, height: s }]}>
            <View
              style={{
                width: s * 0.74,
                height: s * 0.74,
                borderRadius: (s * 0.74) / 2,
                borderWidth: stroke,
                borderColor: color,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <View style={{ width: stroke + 0.5, height: stroke + 0.5, backgroundColor: color, borderRadius: 1, marginBottom: 2 }} />
              <View style={{ width: stroke + 0.5, height: s * 0.26, backgroundColor: color, borderRadius: 1 }} />
            </View>
          </View>
        );

      case 'star':
        return (
          <View style={[styles.center, { width: s, height: s }]}>
            <View
              style={{
                width: s * 0.5,
                height: s * 0.5,
                backgroundColor: color,
                borderRadius: 2,
                transform: [{ rotate: '45deg' }],
              }}
            />
            <View
              style={{
                position: 'absolute',
                width: s * 0.5,
                height: s * 0.5,
                backgroundColor: color,
                borderRadius: 2,
                transform: [{ rotate: '90deg' }],
              }}
            />
          </View>
        );

      case 'crown':
        return (
          <View style={[styles.center, { width: s, height: s }]}>
            <View
              style={{
                width: s * 0.76,
                height: s * 0.44,
                borderBottomWidth: stroke + 1,
                borderLeftWidth: stroke,
                borderRightWidth: stroke,
                borderColor: color,
                position: 'absolute',
                bottom: s * 0.22,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}>
              <View style={{ width: stroke + 1, height: s * 0.26, backgroundColor: color, position: 'absolute', left: 0 }} />
              <View style={{ width: stroke + 1, height: s * 0.34, backgroundColor: color, position: 'absolute', left: '50%', transform: [{ translateX: -(stroke + 1) / 2 }] }} />
              <View style={{ width: stroke + 1, height: s * 0.26, backgroundColor: color, position: 'absolute', right: 0 }} />
            </View>
          </View>
        );

      case 'document':
      case 'terms':
        return (
          <View style={[styles.center, { width: s, height: s }]}>
            <View
              style={{
                width: s * 0.54,
                height: s * 0.72,
                borderRadius: s * 0.08,
                borderWidth: stroke,
                borderColor: color,
                paddingHorizontal: s * 0.08,
                justifyContent: 'space-evenly',
              }}>
              <View style={{ width: '80%', height: stroke - 0.5, backgroundColor: color }} />
              <View style={{ width: '100%', height: stroke - 0.5, backgroundColor: color }} />
              <View style={{ width: '60%', height: stroke - 0.5, backgroundColor: color }} />
            </View>
          </View>
        );

      case 'lock':
      case 'privacy':
        return (
          <View style={[styles.center, { width: s, height: s }]}>
            {/* Shackle */}
            <View
              style={{
                width: s * 0.36,
                height: s * 0.36,
                borderTopLeftRadius: s * 0.18,
                borderTopRightRadius: s * 0.18,
                borderWidth: stroke,
                borderBottomColor: 'transparent',
                borderColor: color,
                position: 'absolute',
                top: s * 0.12,
              }}
            />
            {/* Body */}
            <View
              style={{
                width: s * 0.58,
                height: s * 0.44,
                borderRadius: s * 0.08,
                borderWidth: stroke,
                borderColor: color,
                position: 'absolute',
                bottom: s * 0.14,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <View style={{ width: stroke + 1, height: s * 0.14, backgroundColor: color, borderRadius: 1 }} />
            </View>
          </View>
        );

      case 'scissors':
      case 'tailor':
        return (
          <View style={[styles.center, { width: s, height: s }]}>
            {/* Two Finger Loops */}
            <View
              style={{
                position: 'absolute',
                bottom: s * 0.12,
                left: s * 0.14,
                width: s * 0.28,
                height: s * 0.28,
                borderRadius: (s * 0.28) / 2,
                borderWidth: stroke,
                borderColor: color,
              }}
            />
            <View
              style={{
                position: 'absolute',
                bottom: s * 0.12,
                right: s * 0.14,
                width: s * 0.28,
                height: s * 0.28,
                borderRadius: (s * 0.28) / 2,
                borderWidth: stroke,
                borderColor: color,
              }}
            />
            {/* Crossed Blades */}
            <View
              style={{
                position: 'absolute',
                top: s * 0.12,
                width: stroke,
                height: s * 0.54,
                backgroundColor: color,
                transform: [{ rotate: '-25deg' }],
                left: s * 0.44,
              }}
            />
            <View
              style={{
                position: 'absolute',
                top: s * 0.12,
                width: stroke,
                height: s * 0.54,
                backgroundColor: color,
                transform: [{ rotate: '25deg' }],
                right: s * 0.44,
              }}
            />
          </View>
        );

      case 'needle':
        return (
          <View style={[styles.center, { width: s, height: s }]}>
            <View
              style={{
                width: stroke + 0.5,
                height: s * 0.74,
                backgroundColor: color,
                borderRadius: 1,
                transform: [{ rotate: '45deg' }],
                alignItems: 'center',
              }}>
              <View style={{ width: stroke - 0.5, height: s * 0.14, backgroundColor: '#ffffff', marginTop: s * 0.08 }} />
            </View>
          </View>
        );

      case 'leaf':
        return (
          <View style={[styles.center, { width: s, height: s }]}>
            <View
              style={{
                width: s * 0.58,
                height: s * 0.58,
                borderTopRightRadius: s * 0.58,
                borderBottomLeftRadius: s * 0.58,
                borderWidth: stroke,
                borderColor: color,
                transform: [{ rotate: '-15deg' }],
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <View style={{ width: stroke, height: '70%', backgroundColor: color, transform: [{ rotate: '-45deg' }] }} />
            </View>
          </View>
        );

      default:
        // Elegant minimal fallback dot
        return (
          <View style={[styles.center, { width: s, height: s }]}>
            <View
              style={{
                width: s * 0.3,
                height: s * 0.3,
                borderRadius: (s * 0.3) / 2,
                backgroundColor: color,
              }}
            />
          </View>
        );
    }
  };

  return <View style={[styles.container, { width: s, height: s }, style]}>{renderIcon()}</View>;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
});

export default FairyLuxIcon;
