import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Modal, ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRoamStore } from '../store/useRoamStore';
import { Avatar } from './Avatar';
import { StarRating } from './StarRating';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { Echo } from '../types';

interface Props {
  experienceId: string;
  experienceName: string;
  visible: boolean;
  onClose: () => void;
}

export function EchoSheet({ experienceId, experienceName, visible, onClose }: Props) {
  const { addEcho, getEchosForExperience, getFriendById } = useRoamStore();
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const echoes = getEchosForExperience(experienceId);

  const handleSubmit = () => {
    if (rating === 0) return;
    const echo: Echo = {
      id: Date.now().toString(),
      experienceId,
      friendId: 'mia', // current user
      rating,
      note: note.trim(),
      createdAt: new Date().toISOString(),
    };
    addEcho(echo);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSubmitted(true);
    setRating(0);
    setNote('');
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeText}>Done</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Echoes</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Experience name */}
          <View style={styles.expNameRow}>
            <Text style={styles.expName}>{experienceName}</Text>
            <Text style={styles.echoCount}>
              {echoes.length} echo{echoes.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {/* What is an echo */}
          <View style={styles.explainer}>
            <Text style={styles.explainerText}>
              An echo means "I went here too and can confirm." It adds your rating to the social proof score, making this experience rank higher for friends going to the same city.
            </Text>
          </View>

          {/* Existing echoes */}
          {echoes.length > 0 && (
            <View style={styles.echoList}>
              <Text style={styles.sectionLabel}>FROM YOUR NETWORK</Text>
              {echoes.map((echo) => {
                const friend = getFriendById(echo.friendId);
                return (
                  <View key={echo.id} style={styles.echoRow}>
                    {friend && (
                      <Avatar
                        initials={friend.avatarInitials}
                        color={friend.avatarColor}
                        size={32}
                      />
                    )}
                    <View style={styles.echoContent}>
                      <View style={styles.echoTopRow}>
                        <Text style={styles.echoFriend}>{friend?.name || 'You'}</Text>
                        <StarRating rating={echo.rating} size={13} />
                      </View>
                      {echo.note ? (
                        <Text style={styles.echoNote}>{echo.note}</Text>
                      ) : (
                        <Text style={styles.echoNoteEmpty}>No note added</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Add your echo */}
          {submitted ? (
            <View style={styles.submittedBanner}>
              <Text style={styles.submittedIcon}>✅</Text>
              <View>
                <Text style={styles.submittedTitle}>Echo added!</Text>
                <Text style={styles.submittedSub}>
                  Your rating is now part of this experience's score.
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.addEcho}>
              <Text style={styles.sectionLabel}>ADD YOUR ECHO</Text>
              <Text style={styles.addEchoSub}>
                Have you been here? Add your rating.
              </Text>

              <View style={styles.ratingRow}>
                <StarRating
                  rating={rating}
                  size={36}
                  interactive
                  onRate={(r) => {
                    setRating(r);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                />
                {rating > 0 && (
                  <Text style={styles.ratingLabel}>
                    {['', 'Skip it', 'Okay', 'Good', 'Great', 'Essential'][rating]}
                  </Text>
                )}
              </View>

              <TextInput
                style={styles.noteInput}
                placeholder="Add a note (optional) — what made it special for you?"
                placeholderTextColor={Colors.muted}
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={[styles.submitBtn, rating === 0 && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                activeOpacity={0.85}
              >
                <Text style={styles.submitBtnText}>Echo this experience</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.warm },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  closeText: { fontSize: 16, color: Colors.pine, fontWeight: '600' },
  title: { ...Typography.titleMedium, color: Colors.ink },
  content: { padding: Spacing.lg, paddingBottom: 60 },
  expNameRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  expName: { ...Typography.titleLarge, color: Colors.ink, flex: 1 },
  echoCount: {
    fontSize: 13, color: Colors.muted, fontWeight: '600',
    backgroundColor: Colors.sand, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: Radius.full,
  },
  explainer: {
    backgroundColor: Colors.sand, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.lg,
  },
  explainerText: { fontSize: 13, color: Colors.muted, lineHeight: 19 },
  echoList: { marginBottom: Spacing.xl },
  sectionLabel: {
    ...Typography.label, color: Colors.muted,
    textTransform: 'uppercase', marginBottom: Spacing.md,
  },
  echoRow: {
    flexDirection: 'row', gap: Spacing.md,
    backgroundColor: Colors.card, borderRadius: Radius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  echoContent: { flex: 1 },
  echoTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  echoFriend: { fontSize: 13, fontWeight: '700', color: Colors.ink },
  echoNote: { fontSize: 13, color: '#444', lineHeight: 18 },
  echoNoteEmpty: { fontSize: 12, color: Colors.muted, fontStyle: 'italic' },
  addEcho: {
    backgroundColor: Colors.card, borderRadius: Radius.lg,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border,
  },
  addEchoSub: { ...Typography.bodySmall, color: Colors.muted, marginBottom: Spacing.lg },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, marginBottom: Spacing.lg },
  ratingLabel: { fontSize: 15, fontWeight: '700', color: Colors.terracotta },
  noteInput: {
    backgroundColor: Colors.sand, borderRadius: Radius.md,
    padding: Spacing.md, fontSize: 14, color: Colors.ink,
    borderWidth: 1, borderColor: Colors.border,
    height: 90, marginBottom: Spacing.lg,
  },
  submitBtn: {
    backgroundColor: Colors.pine, borderRadius: Radius.lg,
    paddingVertical: Spacing.md, alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  submittedBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: '#EDF3E8', borderRadius: Radius.lg,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.pine,
  },
  submittedIcon: { fontSize: 28 },
  submittedTitle: { fontSize: 15, fontWeight: '700', color: Colors.pine },
  submittedSub: { fontSize: 13, color: Colors.muted, marginTop: 2 },
});
