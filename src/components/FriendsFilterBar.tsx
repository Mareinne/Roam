import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
} from 'react-native';
import { Colors, Spacing } from '../theme';
import { Friend } from '../types';
import { Avatar } from './Avatar';

interface Props {
  friends: Friend[];
  activeFriendIds: Set<string>;
  onToggle: (id: string) => void;
}

export function FriendsFilterBar({ friends, activeFriendIds, onToggle }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {/* All */}
      <TouchableOpacity
        style={styles.friendWrap}
        onPress={() => onToggle('all')}
        activeOpacity={0.75}
      >
        <View
          style={[
            styles.allBadge,
            !activeFriendIds.has('all') && styles.inactive,
          ]}
        >
          <Text style={styles.allText}>All</Text>
        </View>
        <Text style={styles.friendName}>Everyone</Text>
      </TouchableOpacity>

      {friends
        .filter((f) => f.isFollowing)
        .map((f) => {
          const isActive = activeFriendIds.has('all') || activeFriendIds.has(f.id);
          return (
            <TouchableOpacity
              key={f.id}
              style={styles.friendWrap}
              onPress={() => onToggle(f.id)}
              activeOpacity={0.75}
            >
              <View style={!isActive ? styles.inactive : undefined}>
                <Avatar initials={f.avatarInitials} color={f.avatarColor} size={32} />
              </View>
              <Text style={styles.friendName}>{f.name.split(' ')[0]}</Text>
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
    gap: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.sand,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  friendWrap: {
    alignItems: 'center',
    gap: 3,
  },
  allBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fff',
  },
  friendName: {
    fontSize: 9,
    fontWeight: '500',
    color: Colors.muted,
  },
  inactive: {
    opacity: 0.35,
  },
});
