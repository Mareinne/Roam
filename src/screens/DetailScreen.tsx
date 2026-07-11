import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Linking, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useRoamStore } from '../store/useRoamStore';
import { Avatar } from '../components/Avatar';
import { TypeBadge } from '../components/TypeBadge';
import { StarRating } from '../components/StarRating';
import { EchoSheet } from '../components/EchoSheet';
import { Colors, Typography, Spacing, Radius, TypeBgColors, TypeEmojis } from '../theme';
import { format } from 'date-fns';
import { RootStackParamList } from '../navigation/AppNavigator';

type DetailRoute = RouteProp<RootStackParamList, 'Detail'>;

export function DetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<DetailRoute>();
  const { experienceId } = route.params;
  const [echoVisible, setEchoVisible] = useState(false);

  const { experiences, getFriendById, getEchosForExperience, getFriendWeight } = useRoamStore();
  const exp = experiences.find((e) => e.id === experienceId);
  if (!exp) return null;

  const friend = getFriendById(exp.friendId);
  const echoes = getEchosForExperience(experienceId);
  const friendWeight = getFriendWeight(experienceId);

  const openMaps = () => {
    const url = Platform.select({
      ios: `maps:0,0?q=${exp.latitude},${exp.longitude}`,
      android: `geo:${exp.latitude},${exp.longitude}?q=${exp.latitude},${exp.longitude}`,
    });
    if (url) Linking.openURL(url);
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView showsVerticalScrollIndicator={false} bounces>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: TypeBgColors[exp.type] }]}>
          <TouchableOpacity
            style={[styles.backBtn, { top: insets.top + Spacing.sm }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.heroEmoji}>{TypeEmojis[exp.type]}</Text>
          <View style={styles.heroBadge}>
            <TypeBadge type={exp.type} />
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{exp.name}</Text>
            <View style={styles.ratingBubble}>
              <Text style={styles.ratingText}>★ {exp.rating}.0</Text>
            </View>
          </View>

          <Text style={styles.location}>📍 {exp.location}, {exp.city}</Text>

          {/* Friend-weight score if echoed */}
          {echoes.length > 0 && (
            <View style={styles.weightRow}>
              <Text style={styles.weightLabel}>
                ✦ Friend-weight score: {friendWeight.toFixed(1)}
              </Text>
              <Text style={styles.weightSub}>
                Based on {echoes.length + 1} rating{echoes.length + 1 !== 1 ? 's' : ''} from your network
              </Text>
            </View>
          )}

          <View style={styles.starsRow}>
            <StarRating rating={exp.rating} size={20} />
          </View>

          {/* Photos row */}
          <ScrollView
            horizontal showsHorizontalScrollIndicator={false}
            style={styles.photosRow} contentContainerStyle={{ gap: Spacing.sm }}
          >
            {(['📸', '🌅', '🦎'] as string[]).map((ph, i) => (
              <View key={i} style={[styles.photo, { backgroundColor: TypeBgColors[exp.type] }]}>
                <Text style={styles.photoEmoji}>{ph}</Text>
              </View>
            ))}
          </ScrollView>

          <Text style={styles.sectionLabel}>The honest take</Text>
          <Text style={styles.review}>{exp.review}</Text>

          {/* Echo section */}
          <TouchableOpacity
            style={styles.echoBtn}
            onPress={() => setEchoVisible(true)}
            activeOpacity={0.85}
          >
            <View style={styles.echoBtnLeft}>
              <Text style={styles.echoBtnIcon}>🔁</Text>
              <View>
                <Text style={styles.echoBtnTitle}>
                  Echo this · {echoes.length} echo{echoes.length !== 1 ? 's' : ''}
                </Text>
                <Text style={styles.echoBtnSub}>
                  Been here? Add your rating to the social proof score.
                </Text>
              </View>
            </View>
            <Text style={styles.echoBtnArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.detailsGrid}>
            <View style={styles.detailCell}>
              <Text style={styles.detailLabel}>DATE</Text>
              <Text style={styles.detailValue}>{format(new Date(exp.date), 'MMMM yyyy')}</Text>
            </View>
            <View style={styles.detailCell}>
              <Text style={styles.detailLabel}>AREA</Text>
              <Text style={styles.detailValue}>{exp.location}</Text>
            </View>
            <View style={styles.detailCell}>
              <Text style={styles.detailLabel}>CITY</Text>
              <Text style={styles.detailValue}>{exp.city}, {exp.country}</Text>
            </View>
            <View style={styles.detailCell}>
              <Text style={styles.detailLabel}>RATING</Text>
              <Text style={styles.detailValue}>{exp.rating} / 5</Text>
            </View>
          </View>

          {friend && (
            <View style={styles.whoSection}>
              <Text style={styles.sectionLabel}>Logged by</Text>
              <View style={styles.whoCard}>
                <Avatar initials={friend.avatarInitials} color={friend.avatarColor} size={44} />
                <View style={styles.whoInfo}>
                  <Text style={styles.whoName}>{friend.name}</Text>
                  <Text style={styles.whoMeta}>
                    {friend.memoriesCount} memories · {friend.countriesCount} countries
                  </Text>
                </View>
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.dirBtn} onPress={openMaps} activeOpacity={0.85}>
            <Text style={styles.dirBtnText}>🗺  Get directions</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <EchoSheet
        experienceId={experienceId}
        experienceName={exp.name}
        visible={echoVisible}
        onClose={() => setEchoVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.warm },
  hero: { height: 220, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  backBtn: {
    position: 'absolute', left: Spacing.lg, width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center',
  },
  backArrow: { fontSize: 18, color: Colors.ink },
  heroEmoji: { fontSize: 64 },
  heroBadge: { position: 'absolute', bottom: Spacing.md, left: Spacing.lg },
  body: { padding: Spacing.lg },
  nameRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', marginBottom: Spacing.xs,
  },
  name: { ...Typography.displaySmall, color: Colors.ink, flex: 1, marginRight: Spacing.md, lineHeight: 26 },
  ratingBubble: {
    backgroundColor: '#FEF7DC', paddingHorizontal: Spacing.sm,
    paddingVertical: 4, borderRadius: Radius.sm, flexShrink: 0,
  },
  ratingText: { fontSize: 14, fontWeight: '800', color: '#8A6D0E' },
  location: { ...Typography.bodySmall, color: Colors.muted, marginBottom: Spacing.sm },
  weightRow: {
    backgroundColor: '#EDF3E8', borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.pine + '40',
  },
  weightLabel: { fontSize: 13, fontWeight: '700', color: Colors.pine },
  weightSub: { fontSize: 11, color: Colors.muted, marginTop: 2 },
  starsRow: { marginBottom: Spacing.lg },
  photosRow: { marginBottom: Spacing.lg },
  photo: { width: 100, height: 80, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  photoEmoji: { fontSize: 32 },
  sectionLabel: { ...Typography.label, color: Colors.muted, textTransform: 'uppercase', marginBottom: Spacing.sm },
  review: { ...Typography.bodyMedium, color: '#333', lineHeight: 22, marginBottom: Spacing.xl },
  echoBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.card, borderRadius: Radius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
    marginBottom: Spacing.xl,
  },
  echoBtnLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  echoBtnIcon: { fontSize: 24 },
  echoBtnTitle: { fontSize: 14, fontWeight: '700', color: Colors.ink, marginBottom: 2 },
  echoBtnSub: { fontSize: 12, color: Colors.muted, lineHeight: 16 },
  echoBtnArrow: { fontSize: 22, color: Colors.muted },
  detailsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm,
    marginBottom: Spacing.xxl, padding: Spacing.md,
    backgroundColor: Colors.sand, borderRadius: Radius.lg,
  },
  detailCell: { width: '47%' },
  detailLabel: { ...Typography.caption, color: Colors.muted, fontWeight: '700', letterSpacing: 0.5, marginBottom: 2 },
  detailValue: { ...Typography.bodySmall, color: Colors.ink, fontWeight: '600' },
  whoSection: { marginBottom: Spacing.xxl },
  whoCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.md, backgroundColor: Colors.card,
    borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border,
  },
  whoInfo: { flex: 1 },
  whoName: { ...Typography.titleSmall, color: Colors.ink, marginBottom: 2 },
  whoMeta: { ...Typography.caption, color: Colors.muted },
  dirBtn: {
    backgroundColor: Colors.pine, borderRadius: Radius.lg,
    paddingVertical: Spacing.md, alignItems: 'center', marginBottom: Spacing.lg,
  },
  dirBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
