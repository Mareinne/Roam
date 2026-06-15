import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Experience } from '../types';
import { Colors, Typography, Spacing, Radius, TypeBgColors, TypeEmojis } from '../theme';
import { Avatar } from './Avatar';
import { TypeBadge } from './TypeBadge';
import { StarRating } from './StarRating';
import { useRoamStore } from '../store/useRoamStore';
import { format } from 'date-fns';

interface Props {
  experience: Experience;
  onPress: () => void;
  highlighted?: boolean;
}

export function ExperienceCard({ experience, onPress, highlighted }: Props) {
  const getFriendById = useRoamStore((s) => s.getFriendById);
  const friend = getFriendById(experience.friendId);

  return (
    <TouchableOpacity
      style={[styles.card, highlighted && styles.highlighted]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Emoji header */}
      <View style={[styles.imageArea, { backgroundColor: TypeBgColors[experience.type] }]}>
        <Text style={styles.emoji}>{TypeEmojis[experience.type]}</Text>
      </View>

      <View style={styles.body}>
        {/* Title row */}
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>{experience.name}</Text>
          <View style={styles.ratingInline}>
            <Text style={styles.ratingText}>★ {experience.rating}.0</Text>
          </View>
        </View>

        {/* Location */}
        <Text style={styles.location} numberOfLines={1}>
          📍 {experience.location}
        </Text>

        {/* Review snippet */}
        <Text style={styles.review} numberOfLines={2}>
          {experience.review}
        </Text>

        {/* Footer */}
        <View style={styles.footer}>
          {friend && (
            <View style={styles.whoRow}>
              <Avatar
                initials={friend.avatarInitials}
                color={friend.avatarColor}
                size={20}
              />
              <Text style={styles.whoName}>
                {friend.name} · {format(new Date(experience.date), 'MMM yyyy')}
              </Text>
            </View>
          )}
          <TypeBadge type={experience.type} size="sm" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  highlighted: {
    borderColor: Colors.pine,
    borderWidth: 2,
    shadowColor: Colors.pine,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  imageArea: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 36,
  },
  body: {
    padding: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  name: {
    ...Typography.titleSmall,
    color: Colors.ink,
    flex: 1,
    marginRight: Spacing.sm,
  },
  ratingInline: {
    flexShrink: 0,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.ink,
  },
  location: {
    ...Typography.caption,
    color: Colors.muted,
    marginBottom: Spacing.xs,
  },
  review: {
    ...Typography.bodySmall,
    color: '#555',
    marginBottom: Spacing.sm,
    lineHeight: 17,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  whoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  whoName: {
    ...Typography.caption,
    color: Colors.muted,
    fontWeight: '500',
  },
});
