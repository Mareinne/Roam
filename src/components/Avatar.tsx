import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  initials: string;
  color: string;
  size?: number;
  textColor?: string;
}

export function Avatar({ initials, color, size = 36, textColor = '#fff' }: Props) {
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
      ]}
    >
      <Text style={[styles.text, { fontSize: size * 0.35, color: textColor }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '800',
  },
});
