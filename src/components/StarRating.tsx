import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../theme';

interface Props {
  rating: number;
  maxRating?: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 16,
  interactive = false,
  onRate,
}: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: maxRating }).map((_, i) => {
        const filled = i < rating;
        if (interactive) {
          return (
            <TouchableOpacity key={i} onPress={() => onRate?.(i + 1)}>
              <Text style={[styles.star, { fontSize: size, color: filled ? Colors.terracotta : Colors.border }]}>
                ★
              </Text>
            </TouchableOpacity>
          );
        }
        return (
          <Text
            key={i}
            style={[styles.star, { fontSize: size, color: filled ? Colors.terracotta : Colors.border }]}
          >
            ★
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 2,
  },
  star: {
    lineHeight: undefined,
  },
});
