import React, { useState, useRef } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Image, Animated, RefreshControl, Dimensions, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRoamStore } from '../store/useRoamStore';
import { Avatar } from '../components/Avatar';
import { TypeBadge } from '../components/TypeBadge';
import { StarRating } from '../components/StarRating';
import { Colors, Spacing, Radius, TypeBgColors, TypeEmojis, Typography, MoodEmojis, MoodColors } from '../theme';
import { Experience } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';
import { formatDistanceToNow, isThisWeek, isToday } from 'date-fns';

type Nav = NativeStackNavigationProp<RootStackParamList>;
const { width: W } = Dimensions.get('window');

type FeedFilter = 'all' | 'hometown' | 'travel' | 'thisweek';

function timeLabel(dateStr: string): string {
  const d = new Date(dateStr);
  if (isToday(d)) return 'Today';
  if (isThisWeek(d)) return 'This week';
  return formatDistanceToNow(d, { addSuffix: true });
}

function FeedCard({
  experience, onPress, onEchoPress,
}: {
  experience: Experience;
  onPress: () => void;
  onEchoPress: () => void;
}) {
  const { getFriendById, getEchosForExperience } = useRoamStore();
  const friend = getFriendById(experience.friendId);
  const echoes = getEchosForExperience(experience.id);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scaleAnim, { toValue: 0.985, useNativeDriver: true, speed: 50 }).start();
  const onPressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50 }).start();

  const isHometown = experience.isHometown;

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} activeOpacity={1}>
        {/* Photo or emoji header */}
        {experience.photos.length > 0 ? (
          <Image source={{ uri: experience.photos[0] }} style={styles.cardPhoto} />
        ) : (
          <View style={[styles.cardPhotoFallback, { backgroundColor: TypeBgColors[experience.type] }]}>
            <Text style={styles.cardPhotoEmoji}>{TypeEmojis[experience.type]}</Text>
            {isHometown && (
              <View style={styles.hometownBadge}>
                <Text style={styles.hometownBadgeText}>🏠 Hometown</Text>
              </View>
            )}
          </View>
        )}

        {/* Location pill over photo */}
        {experience.photos.length > 0 && (
          <View style={styles.cityPill}>
            <Text style={styles.cityPillText}>
              {isHometown ? '🏠 ' : '📍 '}{experience.city}
            </Text>
          </View>
        )}

        <View style={styles.cardBody}>
          {/* Author row */}
          {friend && (
            <View style={styles.authorRow}>
              <Avatar initials={friend.avatarInitials} color={friend.avatarColor} size={28} />
              <View style={styles.authorMeta}>
                <Text style={styles.authorName}>{friend.name}</Text>
                <Text style={styles.authorTime}>{timeLabel(experience.createdAt)}</Text>
              </View>
              <TypeBadge type={experience.type} size="sm" />
            </View>
          )}

          {/* Name */}
          <Text style={styles.cardName}>{experience.name}</Text>

          {/* Location line */}
          <Text style={styles.cardLocation}>
            {isHometown ? '🏠' : '📍'} {experience.location}{isHometown ? '' : `, ${experience.city}`}
          </Text>

          {/* Mood pill + stars */}
          <View style={styles.metaRow}>
            {experience.mood && (
              <View style={[styles.moodPill, { backgroundColor: MoodColors[experience.mood] + '20' }]}>
                <Text style={[styles.moodText, { color: MoodColors[experience.mood] }]}>
                  {MoodEmojis[experience.mood]} {experience.mood}
                </Text>
              </View>
            )}
            <StarRating rating={experience.rating} size={13} />
          </View>

          {/* Pull-quote */}
          {experience.review ? (
            <Text style={styles.cardQuote} numberOfLines={3}>
              "{experience.review}"
            </Text>
          ) : null}

          {/* Footer */}
          <View style={styles.cardFooter}>
            {echoes.length > 0 ? (
              <Text style={styles.echoCount}>🔁 {echoes.length} echo{echoes.length !== 1 ? 's' : ''}</Text>
            ) : (
              <View />
            )}
            <TouchableOpacity style={styles.echoBtn} onPress={onEchoPress} activeOpacity={0.8}>
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
  const [filter, setFilter] = useState<FeedFilter>('all');

  const followingIds = new Set(friends.filter((f) => f.isFollowing).map((f) => f.id));

  const allFeed = [...experiences]
    .filter((e) => followingIds.has(e.friendId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filtered = allFeed.filter((e) => {
    if (filter === 'hometown') return e.isHometown;
    if (filter === 'travel') return !e.isHometown;
    if (filter === 'thisweek') return isThisWeek(new Date(e.createdAt));
    return true;
  });

  // Counts for filter chips
  const hometownCount = allFeed.filter((e) => e.isHometown).length;
  const travelCount = allFeed.filter((e) => !e.isHometown).length;
  const thisWeekCount = allFeed.filter((e) => isThisWeek(new Date(e.createdAt))).length;

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const FILTERS: { key: FeedFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: allFeed.length },
    { key: 'hometown', label: '🏠 Hometown', count: hometownCount },
    { key: 'travel', label: '✈️ Travel', count: travelCount },
    { key: 'thisweek', label: '📅 This week', count: thisWeekCount },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>🌿 Roam</Text>
        <TouchableOpacity
          style={styles.logBtn}
          onPress={() => navigation.navigate('Log')}
          activeOpacity={0.85}
        >
          <Text style={styles.logBtnText}>+ Log</Text>
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        style={styles.filtersWrap}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key)}
            activeOpacity={0.75}
          >
            <Text style={[styles.filterChipText, filter === f.key && styles.filterChipTextActive]}>
              {f.label}
            </Text>
            {f.count > 0 && (
              <View style={[styles.filterCount, filter === f.key && styles.filterCountActive]}>
                <Text style={[styles.filterCountText, filter === f.key && { color: Colors.pine }]}>
                  {f.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.pine} />
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
          filter === 'thisweek' && filtered.length > 0 ? (
            <View style={styles.weekendBanner}>
              <Text style={styles.weekendBannerText}>
                💡 {filtered.length} thing{filtered.length !== 1 ? 's' : ''} your friends did this week near you
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>✦</Text>
            <Text style={styles.emptyTitle}>
              {filter === 'hometown' ? 'No hometown logs yet' :
               filter === 'thisweek' ? 'Quiet week so far' :
               'Your feed is empty'}
            </Text>
            <Text style={styles.emptyText}>
              {filter === 'hometown'
                ? 'When your friends log something in their city — a restaurant, a hike, a random Thursday night — it shows up here.'
                : filter === 'thisweek'
                ? "Check back Sunday — this fills up fast when your friends have a good weekend."
                : 'Follow friends and their memories show up here every time they log something — travel or at home.'}
            </Text>
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
  },
  logo: { fontSize: 20, fontWeight: '800', color: Colors.pine },
  logBtn: {
    backgroundColor: Colors.terracotta, borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: 7,
  },
  logBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // Filters
  filtersWrap: {
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    backgroundColor: Colors.warm,
  },
  filters: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, gap: Spacing.xs,
  },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: Spacing.md, paddingVertical: 7,
    borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: 'transparent',
  },
  filterChipActive: { backgroundColor: Colors.pine, borderColor: Colors.pine },
  filterChipText: { fontSize: 13, fontWeight: '600', color: Colors.muted },
  filterChipTextActive: { color: '#fff' },
  filterCount: {
    backgroundColor: Colors.sand, borderRadius: Radius.full,
    paddingHorizontal: 6, paddingVertical: 1,
  },
  filterCountActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  filterCountText: { fontSize: 10, fontWeight: '700', color: Colors.muted },

  list: { padding: Spacing.lg, paddingBottom: 100 },

  weekendBanner: {
    backgroundColor: Colors.sand, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border,
  },
  weekendBannerText: { fontSize: 13, color: Colors.ink, fontWeight: '600', lineHeight: 18 },

  // Card
  card: {
    backgroundColor: Colors.card, borderRadius: Radius.xl,
    overflow: 'hidden', borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardPhoto: { width: '100%', height: 200, resizeMode: 'cover' },
  cardPhotoFallback: {
    width: '100%', height: 120,
    alignItems: 'center', justifyContent: 'center',
  },
  cardPhotoEmoji: { fontSize: 44 },
  hometownBadge: {
    position: 'absolute', bottom: Spacing.sm, left: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm, paddingVertical: 3,
  },
  hometownBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  cityPill: {
    position: 'absolute', top: Spacing.md, left: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
  },
  cityPillText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  cardBody: { padding: Spacing.lg },
  authorRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md,
  },
  authorMeta: { flex: 1 },
  authorName: { fontSize: 13, fontWeight: '700', color: Colors.ink },
  authorTime: { fontSize: 11, color: Colors.muted },
  cardName: {
    fontSize: 19, fontWeight: '800', color: Colors.ink,
    letterSpacing: -0.3, marginBottom: 3,
  },
  cardLocation: { fontSize: 12, color: Colors.muted, marginBottom: Spacing.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  moodPill: {
    paddingHorizontal: Spacing.sm, paddingVertical: 3,
    borderRadius: Radius.full,
  },
  moodText: { fontSize: 12, fontWeight: '700' },
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

  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 36 },
  emptyIcon: { fontSize: 32, color: Colors.pine, marginBottom: Spacing.lg },
  emptyTitle: { ...Typography.titleLarge, color: Colors.ink, marginBottom: Spacing.sm, textAlign: 'center' },
  emptyText: { ...Typography.bodyMedium, color: Colors.muted, textAlign: 'center', lineHeight: 22 },
});
