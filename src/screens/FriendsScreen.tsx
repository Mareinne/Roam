import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useRoamStore } from '../store/useRoamStore';
import { Avatar } from '../components/Avatar';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { Friend } from '../types';

export function FriendsScreen() {
  const insets = useSafeAreaInsets();
  const { friends, toggleFollowFriend } = useRoamStore();

  const handleToggleFollow = (id: string) => {
    toggleFollowFriend(id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderFriend = ({ item }: { item: Friend }) => (
    <View style={styles.card}>
      <Avatar initials={item.avatarInitials} color={item.avatarColor} size={48} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.handle}>@{item.handle}</Text>
        <Text style={styles.stats}>
          {item.memoriesCount} memories · {item.countriesCount} countries
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.followBtn, item.isFollowing && styles.followingBtn]}
        onPress={() => handleToggleFollow(item.id)}
        activeOpacity={0.8}
      >
        <Text style={[styles.followText, item.isFollowing && styles.followingText]}>
          {item.isFollowing ? 'Following' : 'Follow'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Your people</Text>
        <Text style={styles.subtitle}>
          The more friends you follow, the richer your map gets.
        </Text>
      </View>

      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={renderFriend}
        ListFooterComponent={
          <TouchableOpacity style={styles.addFriendBtn}>
            <Text style={styles.addFriendIcon}>＋</Text>
            <View>
              <Text style={styles.addFriendTitle}>Find more friends</Text>
              <Text style={styles.addFriendSub}>Connect your contacts</Text>
            </View>
          </TouchableOpacity>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.warm,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    ...Typography.displaySmall,
    color: Colors.ink,
    marginBottom: 4,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.muted,
    lineHeight: 18,
  },
  listContent: {
    padding: Spacing.lg,
    gap: Spacing.sm,
    paddingBottom: 100,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  info: {
    flex: 1,
  },
  name: {
    ...Typography.titleSmall,
    color: Colors.ink,
  },
  handle: {
    ...Typography.caption,
    color: Colors.muted,
    marginTop: 1,
  },
  stats: {
    ...Typography.caption,
    color: Colors.muted,
    marginTop: 4,
    fontWeight: '500',
  },
  followBtn: {
    backgroundColor: Colors.pine,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    flexShrink: 0,
  },
  followingBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.pine,
  },
  followText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  followingText: {
    color: Colors.pine,
  },
  addFriendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    marginTop: Spacing.sm,
  },
  addFriendIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.sand,
    textAlign: 'center',
    lineHeight: 48,
    fontSize: 22,
    color: Colors.pine,
    overflow: 'hidden',
  },
  addFriendTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.pine,
  },
  addFriendSub: {
    ...Typography.caption,
    color: Colors.muted,
    marginTop: 2,
  },
});
