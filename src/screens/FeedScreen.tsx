import React, { useState, useRef } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Image, Animated, RefreshControl, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRoamStore } from '../store/useRoamStore';
import { Avatar } from '../components/Avatar';
import { TypeBadge } from '../components/TypeBadge';
import { StarRating } from '../components/StarRating';
import { Colors, Spacing, Radius, TypeBgColors, TypeEmojis, Typography } from '../theme';
import { Experience } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';
import { formatDistanceToNow } from 'date-fns';

type Nav = NativeStackNavigationProp<RootStackParamList>;
const { width: W } = Dimensions.get('window');

function FeedCard({ experience, onPress, onEchoPress }: {
  experience: Experience;
  onPress: () => void;
  onEchoPress: () => void;
}) {
  const { getFriendById, getEchosForExperience } = useRoamStore();
  const friend = getFriendById(experience.friendId);
  const echoes = getEchosForExperience(experience.id);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true, speed: 50 }).start();
  const onPressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50 }).start();

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        {/* Photo or emoji header */}
        {experience.photos.length > 0 ? (
          <Image source={{ uri: experience.photos[0] }} style={styles.cardPhoto} />
        ) : (
          <View style={[styles.cardPhotoFallback, { backgroundColor: TypeBgColors[experience.type] }]}>
            <Text style={styles.cardPhotoEmoji}>{TypeEmojis[experience.type]}</Text>
          </View>
        )}

        {/* City pill over photo */}
        <View style={styles.cityPill}>
          <Text style={styles.cityPillText}>📍 {experience.city}</Text>
        </View>

        <View style={styles.cardBody}>
          {/* Author row */}
          {friend && (
            <View style={styles.authorRow}>
              <Avatar initials={friend.avatarInitials} color={friend.avatarColor} size={28} />
              <View style={styles.authorMeta}>
                <Text style={styles.authorName}>{friend.name}</Text>
                <Text style={styles.authorTime}>
                  {formatDistanceToNow(new Date(experience.createdAt), { addSuffix: true })}
                </Text>
              </View>
              <TypeBadge type={experience.type} size="sm" />
            </View>
          )}

          {/* Name + rating */}
          <Text style={styles.cardName}>{experience.name}</Text>
          <View style={styles.ratingRow}>
            <StarRating rating={experience.rating} size={14} />
            <Text style={styles.ratingNum}>{experience.rating}.0</Text>
          </View>

          {/* Pull-quote */}
          {experience.review ? (
            <Text style={styles.cardQuote} numberOfLines={3}>
              "{experience.review}"
            </Text>
          ) : null}

          {/* Footer: echoes + echo button */}
          <View style={styles.cardFooter}>
            {echoes.length > 0 && (
              <Text style={styles.echoCount}>
                🔁 {echoes.length} echo{echoes.length !== 1 ? 's' : ''}
              </Text>
            )}
            <TouchableOpacity
              style={styles.echoBtn}
              onPress={onEchoPress}
              activeOpacity={0.8}
            >
              <Text style={styles.echoBtnText}>+ Echo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function FeedScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { experiences, friends } = useRoamStore();
  const [refreshing, setRefreshing] = useState(false);
  const [newPostsBanner, setNewPostsBanner] = useState(false);

  // Feed = all experiences from followed friends, newest first
  const followingIds = new Set(friends.filter((f) => f.isFollowing).map((f) => f.id));
  const feed = [...experiences]
    .filter((e) => followingIds.has(e.friendId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>🌿 Roam</Text>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.navigate('Log')}
        >
          <Text style={styles.headerBtnText}>+ Log memory</Text>
        </TouchableOpacity>
      </View>

      {/* New posts banner */}
      {newPostsBanner && (
        <TouchableOpacity style={styles.newPostsBanner} onPress={() => setNewPostsBanner(false)}>
          <Text style={styles.newPostsText}>↑ New memories from your friends</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={feed}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.pine}
          />
        }
        ItemSeparatorComponent={() => <View style={{ height: Spacing.lg }} />}
        renderItem={({ item }) => (
          <FeedCard
            experience={item}
            onPress={() => navigation.navigate('Detail', { experienceId: item.id })}
            onEchoPress={() => navigation.navigate('Detail', { experienceId: item.id })}
          />
        )}
        ListHeaderComponent={
          <View style={styles.feedHeader}>
            <Text style={styles.feedHeaderTitle}>Friends' feed</Text>
            <Text style={styles.feedHeaderSub}>
              {feed.length} memories · {followingIds.size} friends
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>✦</Text>
            <Text style={styles.emptyTitle}>Your feed is empty</Text>
            <Text style={styles.emptyText}>
              Follow friends and they'll show up here every time they log a memory.
            </Text>
            <TouchableOpacity
              style={styles.findFriendsBtn}
              onPress={() => {}}
            >
              <Text style={styles.findFriendsBtnText}>Find friends</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.warm },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    backgroundColor: Colors.warm,
  },
  logo: { fontSize: 20, fontWeight: '800', color: Colors.pine },
  headerBtn: {
    backgroundColor: Colors.terracotta, borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: 7,
  },
  headerBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  newPostsBanner: {
    backgroundColor: Colors.pine, paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  newPostsText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  list: { padding: Spacing.lg, paddingBottom: 100 },
  feedHeader: { marginBottom: Spacing.lg },
  feedHeaderTitle: { ...Typography.displaySmall, color: Colors.ink },
  feedHeaderSub: { ...Typography.bodySmall, color: Colors.muted, marginTop: 2 },

  // Cards
  card: {
    backgroundColor: Colors.card, borderRadius: Radius.xl,
    overflow: 'hidden', borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardPhoto: { width: '100%', height: 220, resizeMode: 'cover' },
  cardPhotoFallback: {
    width: '100%', height: 140,
    alignItems: 'center', justifyContent: 'center',
  },
  cardPhotoEmoji: { fontSize: 52 },
  cityPill: {
    position: 'absolute', top: Spacing.md, left: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
  },
  cityPillText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  cardBody: { padding: Spacing.lg },
  authorRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  authorMeta: { flex: 1 },
  authorName: { fontSize: 13, fontWeight: '700', color: Colors.ink },
  authorTime: { fontSize: 11, color: Colors.muted },
  cardName: {
    fontSize: 20, fontWeight: '800', color: Colors.ink,
    letterSpacing: -0.3, marginBottom: 6,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.md },
  ratingNum: { fontSize: 13, fontWeight: '700', color: Colors.ink },
  cardQuote: {
    fontSize: 14, color: '#444', lineHeight: 21,
    fontStyle: 'italic', marginBottom: Spacing.md,
  },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  echoCount: { fontSize: 12, color: Colors.muted, fontWeight: '500' },
  echoBtn: {
    backgroundColor: Colors.sand, borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderWidth: 1, borderColor: Colors.border,
  },
  echoBtnText: { fontSize: 13, fontWeight: '700', color: Colors.ink },

  // Empty
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyIcon: { fontSize: 36, color: Colors.pine, marginBottom: Spacing.lg },
  emptyTitle: { ...Typography.titleLarge, color: Colors.ink, marginBottom: Spacing.sm },
  emptyText: { ...Typography.bodyMedium, color: Colors.muted, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xl },
  findFriendsBtn: {
    backgroundColor: Colors.pine, borderRadius: Radius.full,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
  },
  findFriendsBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
