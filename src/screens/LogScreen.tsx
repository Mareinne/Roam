import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useRoamStore } from '../store/useRoamStore';
import { StarRating } from '../components/StarRating';
import {
  Colors, Typography, Spacing, Radius,
  TypeEmojis, TypeBgColors,
} from '../theme';
import { ExperienceType } from '../types';

const TYPES: ExperienceType[] = ['food', 'nature', 'nightlife', 'tip', 'stay', 'culture'];

const TYPE_LABELS: Record<ExperienceType, string> = {
  food: 'Food & Drinks',
  nature: 'Nature',
  nightlife: 'Nightlife',
  tip: 'Local Tip',
  stay: 'Stay',
  culture: 'Culture',
};

export function LogScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const addExperience = useRoamStore((s) => s.addExperience);

  const [name, setName] = useState('');
  const [type, setType] = useState<ExperienceType>('food');
  const [location, setLocation] = useState('');
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotos((prev) => [...prev, ...result.assets.map((a) => a.uri)]);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Give this memory a name.');
      return;
    }
    if (rating === 0) {
      Alert.alert('Rating required', 'How would you rate this?');
      return;
    }

    const newExp = {
      id: Date.now().toString(),
      name: name.trim(),
      type,
      location: location.trim() || 'Cancún, Mexico',
      city: 'Cancún',
      country: 'Mexico',
      latitude: 21.1 + Math.random() * 0.1,
      longitude: -86.85 + Math.random() * 0.1,
      rating,
      review: review.trim(),
      photos,
      friendId: 'mia', // current user
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    addExperience(newExp);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Log a memory</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Type picker */}
          <Text style={styles.label}>What kind of experience?</Text>
          <View style={styles.typeGrid}>
            {TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.typeOption,
                  type === t && styles.typeOptionSelected,
                  type === t && { borderColor: TypeBgColors[t] },
                ]}
                onPress={() => {
                  setType(t);
                  Haptics.selectionAsync();
                }}
              >
                <View
                  style={[
                    styles.typeIconBg,
                    { backgroundColor: type === t ? TypeBgColors[t] : Colors.sand },
                  ]}
                >
                  <Text style={styles.typeEmoji}>{TypeEmojis[t]}</Text>
                </View>
                <Text style={[styles.typeLabel, type === t && { color: Colors.ink }]}>
                  {TYPE_LABELS[t]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Name */}
          <Text style={styles.label}>Name it</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Best sunset hike off highway 307"
            placeholderTextColor={Colors.muted}
            value={name}
            onChangeText={setName}
            returnKeyType="next"
          />

          {/* Location */}
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="Address or area (tap map to pin)"
            placeholderTextColor={Colors.muted}
            value={location}
            onChangeText={setLocation}
            returnKeyType="next"
          />

          {/* Rating */}
          <Text style={styles.label}>Your rating</Text>
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
                {['', 'Meh', 'Okay', 'Good', 'Great', 'Essential'][rating]}
              </Text>
            )}
          </View>

          {/* Review */}
          <Text style={styles.label}>The honest take</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="What made it special? What should your friends know before going? Be real."
            placeholderTextColor={Colors.muted}
            value={review}
            onChangeText={setReview}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          {/* Photos */}
          <Text style={styles.label}>Photos</Text>
          <View style={styles.photosRow}>
            {photos.map((uri, i) => (
              <View key={i} style={styles.photoThumb}>
                <Text style={{ fontSize: 32 }}>📸</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.addPhotoBtn} onPress={pickPhoto}>
              <Text style={styles.addPhotoIcon}>+</Text>
              <Text style={styles.addPhotoLabel}>Add photos</Text>
            </TouchableOpacity>
          </View>

          {/* Save */}
          <TouchableOpacity
            style={[styles.saveBtn, (!name || rating === 0) && styles.saveBtnDisabled]}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>Save memory</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.warm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  cancelText: {
    fontSize: 16,
    color: Colors.muted,
    fontWeight: '500',
  },
  headerTitle: {
    ...Typography.titleMedium,
    color: Colors.ink,
  },
  saveText: {
    fontSize: 16,
    color: Colors.pine,
    fontWeight: '700',
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 60,
  },
  label: {
    ...Typography.label,
    color: Colors.muted,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  typeOption: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    gap: Spacing.xs,
  },
  typeOptionSelected: {
    borderWidth: 2,
  },
  typeIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeEmoji: {
    fontSize: 22,
  },
  typeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.muted,
    textAlign: 'center',
  },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 15,
    color: Colors.ink,
  },
  textarea: {
    height: 110,
    paddingTop: Spacing.md,
    lineHeight: 22,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.terracotta,
  },
  photosRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  photoThumb: {
    width: 72,
    height: 72,
    borderRadius: Radius.md,
    backgroundColor: Colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoBtn: {
    width: 72,
    height: 72,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  addPhotoIcon: {
    fontSize: 22,
    color: Colors.muted,
    fontWeight: '300',
  },
  addPhotoLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.muted,
  },
  saveBtn: {
    backgroundColor: Colors.pine,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.xxl,
  },
  saveBtnDisabled: {
    opacity: 0.45,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
