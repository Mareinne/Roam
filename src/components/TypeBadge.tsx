import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ExperienceType } from '../types';
import { TypeColors, TypeBgColors, TypeTextColors, TypeEmojis } from '../theme';

interface Props {
  type: ExperienceType;
  size?: 'sm' | 'md';
}

export function TypeBadge({ type, size = 'md' }: Props) {
  const isSmall = size === 'sm';
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: TypeBgColors[type],
          paddingHorizontal: isSmall ? 6 : 10,
          paddingVertical: isSmall ? 2 : 4,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: TypeTextColors[type], fontSize: isSmall ? 10 : 12 },
        ]}
      >
        {TypeEmojis[type]} {type}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontWeight: '700',
    textTransform: 'capitalize',
    letterSpacing: 0.3,
  },
});
