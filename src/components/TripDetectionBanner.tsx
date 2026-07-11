import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions,
} from 'react-native';
import { useRoamStore } from '../store/useRoamStore';
import { Colors, Spacing, Radius } from '../theme';
import { useTripDetection } from '../hooks/useTripDetection';

interface Props {
  onLogPress: () => void;
  onExplorePress: (city: string) => void;
}

export function TripDetectionBanner({ onLogPress, onExplorePress }: Props) {
  const { detectedCity, markCityPrompted } = useTripDetection();
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const shown = detectedCity && !detectedCity.hasPrompted;

  useEffect(() => {
    if (shown) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }).start();
    }
  }, [shown]);

  if (!shown) return null;

  const dismiss = () => {
    Animated.timing(slideAnim, {
      toValue: -120,
      duration: 250,
      useNativeDriver: true,
    }).start(() => markCityPrompted());
  };

  return (
    <Animated.View style={[styles.banner, { transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.left}>
        <Text style={styles.emoji}>✈️</Text>
        <View>
          <Text style={styles.title}>You're in {detectedCity!.city}!</Text>
          <Text style={styles.sub}>You've been here 24h — log what you've done</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.exploreBtn}
          onPress={() => {
            onExplorePress(detectedCity!.city);
            dismiss();
          }}
        >
          <Text style={styles.exploreBtnText}>See friends' picks</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.logBtn}
          onPress={() => {
            onLogPress();
            dismiss();
          }}
        >
          <Text style={styles.logBtnText}>+ Log</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={dismiss} style={styles.dismiss}>
          <Text style={styles.dismissText}>✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: Colors.pine,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  emoji: { fontSize: 24 },
  title: { color: '#fff', fontSize: 15, fontWeight: '800' },
  sub: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  exploreBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.full,
    paddingVertical: 7,
    alignItems: 'center',
  },
  exploreBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  logBtn: {
    backgroundColor: Colors.terracotta,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
  },
  logBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  dismiss: { padding: 4 },
  dismissText: { color: 'rgba(255,255,255,0.5)', fontSize: 16 },
});
