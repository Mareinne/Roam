import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  TextInput, Modal, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useRoamStore } from '../store/useRoamStore';
import { ExperienceCard } from '../components/ExperienceCard';
import { Avatar } from '../components/Avatar';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { Trip } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';
import { format, addDays } from 'date-fns';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const SUGGESTED_CITIES = [
  { city: 'Cancún', country: 'Mexico', emoji: '🌴' },
  { city: 'Paris', country: 'France', emoji: '🗼' },
  { city: 'Tokyo', country: 'Japan', emoji: '🏯' },
  { city: 'New York', country: 'USA', emoji: '🗽' },
  { city: 'London', country: 'UK', emoji: '🎡' },
  { city: 'Barcelona', country: 'Spain', emoji: '🎨' },
];

export function PreTripScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const {
    plannedTrips, addPlannedTrip, removePlannedTrip,
    setActivePreTrip, getExperiencesForCity, friends, getFriendById,
  } = useRoamStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [startDate, setStartDate] = useState(
    format(addDays(new Date(), 7), 'yyyy-MM-dd')
  );
  const [previewTrip, setPreviewTrip] = useState<Trip | null>(null);

  const previewExperiences = previewTrip
    ? getExperiencesForCity(previewTrip.city)
    : [];

  const friendsWhoVisiited = previewTrip
    ? [...new Set(previewExperiences.map((e) => e.friendId))]
        .map((id) => getFriendById(id))
        .filter(Boolean)
    : [];

  const handleAddTrip = () => {
    if (!selectedCity) return;
    const trip: Trip = {
      id: Date.now().toString(),
      city: selectedCity,
      country: selectedCountry,
      startDate,
      isActive: false,
    };
    addPlannedTrip(trip);
    setShowAddModal(false);
    setSelectedCity('');
    setSelectedCountry('');
    setCitySearch('');
    setPreviewTrip(trip);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const filtered = SUGGESTED_CITIES.filter(
    (c) =>
      !citySearch ||
      c.city.toLowerCase().includes(citySearch.toLowerCase()) ||
      c.country.toLowerCase().includes(citySearch.toLowerCase())
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Pre-trip</Text>
          <Text style={styles.subtitle}>See what your friends did before you go</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addBtnText}>+ Add trip</Text>
        </TouchableOpacity>
      </View>

      {/* Planned trips */}
      {plannedTrips.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tripsRow}
        >
          {plannedTrips.map((trip) => {
            const exps = getExperiencesForCity(trip.city);
            const isSelected = previewTrip?.id === trip.id;
            return (
              <TouchableOpacity
                key={trip.id}
                style={[styles.tripCard, isSelected && styles.tripCardActive]}
                onPress={() => setPreviewTrip(isSelected ? null : trip)}
                activeOpacity={0.85}
              >
                <Text style={styles.tripEmoji}>
                  {SUGGESTED_CITIES.find((c) => c.city === trip.city)?.emoji || '✈️'}
                </Text>
                <Text style={[styles.tripCity, isSelected && styles.tripCityActive]}>
                  {trip.city}
                </Text>
                <Text style={[styles.tripDate, isSelected && styles.tripDateActive]}>
                  {format(new Date(trip.startDate), 'MMM d')}
                </Text>
                <View style={[styles.tripBadge, isSelected && styles.tripBadgeActive]}>
                  <Text style={[styles.tripBadgeText, isSelected && styles.tripBadgeTextActive]}>
                    {exps.length} picks
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Preview panel */}
      {previewTrip ? (
        <View style={styles.previewContainer}>
          {/* Friends who've been */}
          {friendsWhoVisiited.length > 0 && (
            <View style={styles.friendsWhoRow}>
              <Text style={styles.friendsWhoLabel}>Friends who've been to {previewTrip.city}</Text>
              <View style={styles.friendAvatars}>
                {friendsWhoVisiited.map((f: any) => (
                  <View key={f.id} style={styles.friendAvatarWrap}>
                    <Avatar initials={f.avatarInitials} color={f.avatarColor} size={36} />
                    <Text style={styles.friendAvatarName}>{f.name.split(' ')[0]}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Sort note */}
          <View style={styles.sortNote}>
            <Text style={styles.sortNoteText}>
              ✦ Sorted by friend-weight — most echoed experiences first
            </Text>
          </View>

          <FlatList
            data={previewExperiences}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <ExperienceCard
                experience={item}
                onPress={() =>
                  navigation.navigate('Detail', { experienceId: item.id })
                }
              />
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>🗺</Text>
                <Text style={styles.emptyTitle}>No picks yet for {previewTrip.city}</Text>
                <Text style={styles.emptyText}>
                  Be the first in your circle to log something there — or invite friends who've been.
                </Text>
              </View>
            }
          />
        </View>
      ) : (
        /* Empty state */
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>✈️</Text>
          <Text style={styles.emptyStateTitle}>Plan a trip</Text>
          <Text style={styles.emptyStateText}>
            Add a destination and instantly see everything your friends have logged there — sorted by who you trust most.
          </Text>
          <TouchableOpacity
            style={styles.emptyAddBtn}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.emptyAddBtnText}>Add your first trip</Text>
          </TouchableOpacity>

          {/* Quick city suggestions */}
          <View style={styles.suggestions}>
            <Text style={styles.suggestionsLabel}>Popular in your network</Text>
            <View style={styles.suggestionChips}>
              {SUGGESTED_CITIES.slice(0, 4).map((c) => (
                <TouchableOpacity
                  key={c.city}
                  style={styles.suggestionChip}
                  onPress={() => {
                    const trip: Trip = {
                      id: Date.now().toString(),
                      city: c.city,
                      country: c.country,
                      startDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
                      isActive: false,
                    };
                    addPlannedTrip(trip);
                    setPreviewTrip(trip);
                  }}
                >
                  <Text style={styles.suggestionEmoji}>{c.emoji}</Text>
                  <Text style={styles.suggestionCity}>{c.city}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Add Trip Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Where are you going?</Text>
            <TouchableOpacity onPress={handleAddTrip}>
              <Text style={[styles.modalSave, !selectedCity && { opacity: 0.35 }]}>
                Add
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.modalSearch}
            placeholder="Search city..."
            placeholderTextColor={Colors.muted}
            value={citySearch}
            onChangeText={setCitySearch}
            autoFocus
          />

          <ScrollView contentContainerStyle={styles.cityList}>
            {filtered.map((c) => (
              <TouchableOpacity
                key={c.city}
                style={[
                  styles.cityRow,
                  selectedCity === c.city && styles.cityRowSelected,
                ]}
                onPress={() => {
                  setSelectedCity(c.city);
                  setSelectedCountry(c.country);
                  Haptics.selectionAsync();
                }}
              >
                <Text style={styles.cityEmoji}>{c.emoji}</Text>
                <View style={styles.cityInfo}>
                  <Text style={styles.cityName}>{c.city}</Text>
                  <Text style={styles.cityCountry}>{c.country}</Text>
                </View>
                {selectedCity === c.city && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Departure date</Text>
            <TextInput
              style={styles.dateInput}
              value={startDate}
              onChangeText={setStartDate}
              placeholder="yyyy-mm-dd"
              placeholderTextColor={Colors.muted}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.warm },
  header: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg,
    paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title: { ...Typography.displaySmall, color: Colors.ink },
  subtitle: { ...Typography.bodySmall, color: Colors.muted, marginTop: 2 },
  addBtn: {
    backgroundColor: Colors.pine, borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: 8,
  },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  tripsRow: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.sm,
  },
  tripCard: {
    backgroundColor: Colors.card, borderRadius: Radius.lg,
    padding: Spacing.md, borderWidth: 1.5, borderColor: Colors.border,
    alignItems: 'center', minWidth: 90,
  },
  tripCardActive: { borderColor: Colors.pine, backgroundColor: '#EDF3E8' },
  tripEmoji: { fontSize: 28, marginBottom: 4 },
  tripCity: { fontSize: 13, fontWeight: '700', color: Colors.ink },
  tripCityActive: { color: Colors.pine },
  tripDate: { fontSize: 11, color: Colors.muted, marginTop: 2 },
  tripDateActive: { color: Colors.pineMid },
  tripBadge: {
    backgroundColor: Colors.sand, borderRadius: Radius.full,
    paddingHorizontal: 8, paddingVertical: 2, marginTop: 6,
  },
  tripBadgeActive: { backgroundColor: Colors.pine },
  tripBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.muted },
  tripBadgeTextActive: { color: '#fff' },
  previewContainer: { flex: 1 },
  friendsWhoRow: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  friendsWhoLabel: { ...Typography.caption, color: Colors.muted, fontWeight: '700', marginBottom: Spacing.sm },
  friendAvatars: { flexDirection: 'row', gap: Spacing.md },
  friendAvatarWrap: { alignItems: 'center', gap: 4 },
  friendAvatarName: { fontSize: 10, color: Colors.muted, fontWeight: '500' },
  sortNote: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xs,
    backgroundColor: Colors.sand, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  sortNoteText: { fontSize: 11, color: Colors.muted, fontWeight: '500' },
  listContent: { padding: Spacing.lg, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 40, paddingHorizontal: Spacing.xxl },
  emptyIcon: { fontSize: 40, marginBottom: Spacing.md },
  emptyTitle: { ...Typography.titleMedium, color: Colors.ink, marginBottom: 4 },
  emptyText: { ...Typography.bodySmall, color: Colors.muted, textAlign: 'center', lineHeight: 18 },
  emptyState: { flex: 1, alignItems: 'center', paddingTop: 60, paddingHorizontal: Spacing.xxl },
  emptyStateIcon: { fontSize: 48, marginBottom: Spacing.lg },
  emptyStateTitle: { ...Typography.displaySmall, color: Colors.ink, marginBottom: Spacing.sm },
  emptyStateText: { ...Typography.bodyMedium, color: Colors.muted, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xl },
  emptyAddBtn: {
    backgroundColor: Colors.pine, borderRadius: Radius.full,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, marginBottom: Spacing.xxl,
  },
  emptyAddBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  suggestions: { width: '100%' },
  suggestionsLabel: { ...Typography.label, color: Colors.muted, textTransform: 'uppercase', marginBottom: Spacing.md },
  suggestionChips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  suggestionChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.card, borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  suggestionEmoji: { fontSize: 16 },
  suggestionCity: { fontSize: 13, fontWeight: '600', color: Colors.ink },
  modal: { flex: 1, backgroundColor: Colors.warm },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  modalCancel: { fontSize: 16, color: Colors.muted },
  modalTitle: { ...Typography.titleMedium, color: Colors.ink },
  modalSave: { fontSize: 16, color: Colors.pine, fontWeight: '700' },
  modalSearch: {
    margin: Spacing.lg, padding: Spacing.md,
    backgroundColor: Colors.sand, borderRadius: Radius.md,
    fontSize: 15, color: Colors.ink,
    borderWidth: 1, borderColor: Colors.border,
  },
  cityList: { paddingHorizontal: Spacing.lg, gap: Spacing.xs },
  cityRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.md, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card,
  },
  cityRowSelected: { borderColor: Colors.pine, backgroundColor: '#EDF3E8' },
  cityEmoji: { fontSize: 28 },
  cityInfo: { flex: 1 },
  cityName: { fontSize: 15, fontWeight: '700', color: Colors.ink },
  cityCountry: { fontSize: 12, color: Colors.muted, marginTop: 1 },
  checkmark: { fontSize: 18, color: Colors.pine, fontWeight: '700' },
  dateRow: {
    margin: Spacing.lg, padding: Spacing.md,
    backgroundColor: Colors.card, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  dateLabel: { ...Typography.label, color: Colors.muted, marginBottom: Spacing.xs },
  dateInput: { fontSize: 15, color: Colors.ink },
});
