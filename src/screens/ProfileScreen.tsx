import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoamStore } from '../store/useRoamStore';
import { Avatar } from '../components/Avatar';
import { ExperienceCard } from '../components/ExperienceCard';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { useNavigation } from '@react-navigation/native';

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { experiences } = useRoamStore();

  // Current user is "mia" in seed data
  const myExperiences = experiences.filter((e) => e.friendId === 'mia');

  const stats = [
    { label: 'Memories', value: myExperiences.length },
    { label: 'Countries', value: 3 },
    { label: 'Following', value: 4 },
  ];

  return (
    <ScrollView
      style={[styles.container]}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile header */}
      <View style={[styles.profileHeader, { paddingTop: insets.top + Spacing.lg }]}>
        <Avatar initials="AJ" color={Colors.pine} size={72} />
        <Text style={styles.profileName}>AJ</Text>
        <Text style={styles.profileHandle}>@aj</Text>

        <View style={styles.statsRow}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statItem}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* My memories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your memories</Text>
        <Text style={styles.sectionSub}>{myExperiences.length} logged</Text>
      </View>

      <View style={styles.list}>
        {myExperiences.map((exp) => (
          <ExperienceCard
            key={exp.id}
            experience={exp}
            onPress={() =>
              navigation.navigate('Detail', { experienceId: exp.id })
            }
          />
        ))}
        {myExperiences.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✦</Text>
            <Text style={styles.emptyTitle}>No memories yet</Text>
            <Text style={styles.emptyText}>Start logging and your experiences will show up here.</Text>
            <TouchableOpacity
              style={styles.logBtn}
              onPress={() => navigation.navigate('Log')}
            >
              <Text style={styles.logBtnText}>Log your first memory</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.warm,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.pine,
  },
  profileName: {
    ...Typography.displayMedium,
    color: '#fff',
    marginTop: Spacing.md,
  },
  profileHandle: {
    ...Typography.bodySmall,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 2,
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.xxxl,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '500',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.titleLarge,
    color: Colors.ink,
  },
  sectionSub: {
    ...Typography.caption,
    color: Colors.muted,
    marginTop: 2,
  },
  list: {
    paddingHorizontal: Spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: Spacing.xxxl,
    paddingHorizontal: Spacing.xxl,
  },
  emptyIcon: {
    fontSize: 32,
    color: Colors.pine,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Typography.titleMedium,
    color: Colors.ink,
    marginBottom: Spacing.xs,
  },
  emptyText: {
    ...Typography.bodySmall,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.lg,
  },
  logBtn: {
    backgroundColor: Colors.pine,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
  },
  logBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
