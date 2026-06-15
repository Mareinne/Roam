import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { FilterType } from '../types';
import { Colors, Spacing, Radius } from '../theme';

const FILTERS: { label: string; value: FilterType; emoji: string }[] = [
  { label: 'All', value: 'all', emoji: '✦' },
  { label: 'Food', value: 'food', emoji: '🍽' },
  { label: 'Nature', value: 'nature', emoji: '🌿' },
  { label: 'Nightlife', value: 'nightlife', emoji: '🌙' },
  { label: 'Tips', value: 'tip', emoji: '💡' },
  { label: 'Stay', value: 'stay', emoji: '🏨' },
  { label: 'Culture', value: 'culture', emoji: '🎭' },
];

interface Props {
  active: FilterType;
  onSelect: (f: FilterType) => void;
}

export function FilterBar({ active, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {FILTERS.map((f) => {
        const isActive = active === f.value;
        return (
          <TouchableOpacity
            key={f.value}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onSelect(f.value)}
            activeOpacity={0.75}
          >
            <Text style={styles.chipEmoji}>{f.emoji}</Text>
            <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
    flexDirection: 'row',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: 'transparent',
  },
  chipActive: {
    backgroundColor: Colors.pine,
    borderColor: Colors.pine,
  },
  chipEmoji: {
    fontSize: 13,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.muted,
  },
  chipLabelActive: {
    color: '#fff',
  },
});
