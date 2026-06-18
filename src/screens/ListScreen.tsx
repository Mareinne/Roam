import React from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRoamStore } from '../store/useRoamStore';
import { ExperienceCard } from '../components/ExperienceCard';
import { FilterBar } from '../components/FilterBar';
import { FriendsFilterBar } from '../components/FriendsFilterBar';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { SortType } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const SORT_OPTIONS: { label: string; value: SortType }[] = [
  { label: '★ Rated', value: 'rating' },
  { label: '🕐 Recent', value: 'recent' },
  { label: '👤 Friend', value: 'friend' },
];

export function ListScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const {
    activeFilter, setFilter,
    activeFriendIds, toggleFriend,
    friends, sortType, setSort,
    selectedExperienceId, selectExperience,
    getVisibleExperiences,
  } = useRoamStore();

  const visible = getVisibleExperiences();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Friends' picks</Text>
        <Text style={styles.subtitle}>Cancún · {visible.length} experiences</Text>
      </View>

      <FilterBar active={activeFilter} onSelect={setFilter} />
      <FriendsFilterBar
        friends={friends}
        activeFriendIds={activeFriendIds}
        onToggle={toggleFriend}
      />

      <View style={styles.sortRow}>
        <Text style={styles.countLabel}>
          {visible.length} result{visible.length !== 1 ? 's' : ''}
        </Text>
        <View style={styles.sortOptions}>
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setSort(opt.value)}
              style={[styles.sortChip, sortType === opt.value && styles.sortChipActive]}
            >
              <Text style={[styles.sortText, sortType === opt.value && styles.sortTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ExperienceCard
            experience={item}
            highlighted={item.id === selectedExperienceId}
            onPress={() => {
              selectExperience(item.id);
              navigation.navigate('Detail', { experienceId: item.id });
            }}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🗺</Text>
            <Text style={styles.emptyTitle}>Nothing here yet</Text>
            <Text style={styles.emptyText}>
              Try different filters, or be the first to log something here.
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
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title: { ...Typography.displaySmall, color: Colors.ink },
  subtitle: { ...Typography.bodySmall, color: Colors.muted, marginTop: 2 },
  sortRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  countLabel: { ...Typography.caption, color: Colors.muted, fontWeight: '600' },
  sortOptions: { flexDirection: 'row', gap: Spacing.xs },
  sortChip: {
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border,
  },
  sortChipActive: { backgroundColor: Colors.pine, borderColor: Colors.pine },
  sortText: { fontSize: 11, fontWeight: '600', color: Colors.muted },
  sortTextActive: { color: '#fff' },
  listContent: { padding: Spacing.lg, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: Spacing.xxxl },
  emptyIcon: { fontSize: 44, marginBottom: Spacing.md },
  emptyTitle: { ...Typography.titleMedium, color: Colors.ink, marginBottom: Spacing.xs },
  emptyText: { ...Typography.bodySmall, color: Colors.muted, textAlign: 'center', lineHeight: 18 },
});
