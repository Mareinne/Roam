import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Image, Animated, Dimensions, KeyboardAvoidingView,
  Platform, ScrollView, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useRoamStore } from '../store/useRoamStore';
import { StarRating } from '../components/StarRating';
import { Colors, Spacing, Radius, TypeEmojis, TypeColors, TypeBgColors } from '../theme';
import { ExperienceType } from '../types';

const { width: W, height: H } = Dimensions.get('window');

type Step = 'photo' | 'type' | 'where' | 'write' | 'rate' | 'preview';

const TYPES: { type: ExperienceType; emoji: string; label: string; prompt: string }[] = [
  { type: 'food',      emoji: '🍽', label: 'Food & Drinks',  prompt: 'A meal, cafe, bar, or market worth knowing about.' },
  { type: 'nature',    emoji: '🌿', label: 'Nature',         prompt: 'A hike, beach, viewpoint, or outdoor moment.' },
  { type: 'nightlife', emoji: '🌙', label: 'Nightlife',      prompt: 'A club, rooftop, bar crawl, or late-night spot.' },
  { type: 'tip',       emoji: '💡', label: 'Local Tip',      prompt: 'Something only a local would know.' },
  { type: 'stay',      emoji: '🏨', label: 'Stay',           prompt: 'A hotel, hostel, Airbnb, or place to sleep.' },
  { type: 'culture',   emoji: '🎭', label: 'Culture',        prompt: 'A museum, market, festival, or neighbourhood.' },
];

const PROMPTS: Record<ExperienceType, string[]> = {
  food:      ['What made the meal worth remembering?', 'Describe it like you\'re texting a friend.', 'What should they order first?'],
  nature:    ['What did it feel like to be there?', 'What time of day was best?', 'What would you tell someone before they go?'],
  nightlife: ['Set the scene — who goes, what\'s the vibe?', 'What\'s the move for getting in / pricing?', 'How does the night usually end?'],
  tip:       ['What do most visitors miss?', 'What\'s the insider version of this?', 'How does knowing this change the trip?'],
  stay:      ['First impression vs. after a few nights?', 'What\'s the room / vibe actually like?', 'Who is this perfect for?'],
  culture:   ['Why did this one stick with you?', 'What surprised you about it?', 'What\'s the context someone needs to appreciate it?'],
};

export function LogScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const addExperience = useRoamStore((s) => s.addExperience);

  const [step, setStep] = useState<Step>('photo');
  const [photo, setPhoto] = useState<string | null>(null);
  const [type, setType] = useState<ExperienceType>('food');
  const [location, setLocation] = useState('');
  const [name, setName] = useState('');
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(0);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const currentPrompt = PROMPTS[type][Math.floor(Math.random() * 3)];

  const animateNext = (nextStep: Step) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setStep(nextStep);
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    });
  };

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Photos needed', 'Allow photo access to add pictures to your memory.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: true,
      aspect: [4, 5],
    });
    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      animateNext('type');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Camera needed', 'Allow camera access to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.85,
      allowsEditing: true,
      aspect: [4, 5],
    });
    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      animateNext('type');
    }
  };

  const skipPhoto = () => {
    Haptics.selectionAsync();
    animateNext('type');
  };

  const goBack = () => {
    const steps: Step[] = ['photo', 'type', 'where', 'write', 'rate', 'preview'];
    const idx = steps.indexOf(step);
    if (idx > 0) {
      animateNext(steps[idx - 1]);
    } else {
      navigation.goBack();
    }
  };

  const handleSave = () => {
    const exp = {
      id: Date.now().toString(),
      name: name.trim() || location.trim() || 'Untitled memory',
      type,
      location: location.trim() || 'Unknown',
      city: 'Cancún',
      country: 'Mexico',
      latitude: 21.1 + Math.random() * 0.1,
      longitude: -86.85 + Math.random() * 0.1,
      rating,
      review: review.trim(),
      photos: photo ? [photo] : [],
      friendId: 'mia',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };
    addExperience(exp);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.goBack();
  };

  const progress = ['photo', 'type', 'where', 'write', 'rate', 'preview'].indexOf(step) / 5;

  return (
    <View style={styles.root}>
      {/* Full-bleed photo background */}
      {photo ? (
        <Image source={{ uri: photo }} style={styles.bgPhoto} />
      ) : (
        <View style={[styles.bgPhoto, { backgroundColor: TypeColors[type] + '22' }]} />
      )}

      {/* Dark overlay — lighter on photo steps */}
      <View style={[
        styles.overlay,
        { backgroundColor: photo ? 'rgba(0,0,0,0.45)' : 'rgba(253,250,245,0.97)' }
      ]} />

      {/* Progress bar */}
      <View style={[styles.progressBar, { top: insets.top + 8 }]}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <TouchableOpacity onPress={goBack} style={styles.backBtn}>
          <Text style={[styles.backArrow, photo && { color: '#fff' }]}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Text style={[styles.closeX, photo && { color: 'rgba(255,255,255,0.7)' }]}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Step content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim, paddingTop: insets.top + 52 }]}>

        {/* STEP: PHOTO */}
        {step === 'photo' && (
          <View style={styles.photoStep}>
            <Text style={styles.stepHeading}>Start with a photo.</Text>
            <Text style={styles.stepSub}>Every great memory deserves one.</Text>
            <View style={styles.photoActions}>
              <TouchableOpacity style={styles.photoBtnPrimary} onPress={takePhoto} activeOpacity={0.85}>
                <Text style={styles.photoBtnIcon}>📷</Text>
                <Text style={styles.photoBtnLabel}>Take photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoBtnPrimary} onPress={pickPhoto} activeOpacity={0.85}>
                <Text style={styles.photoBtnIcon}>🖼</Text>
                <Text style={styles.photoBtnLabel}>Choose from library</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={skipPhoto} style={styles.skipBtn}>
              <Text style={styles.skipText}>Skip — log without a photo</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP: TYPE */}
        {step === 'type' && (
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <View style={styles.typeStep}>
              <Text style={[styles.stepHeading, photo && styles.stepHeadingLight]}>
                What kind of experience?
              </Text>
              <View style={styles.typeGrid}>
                {TYPES.map((t) => (
                  <TouchableOpacity
                    key={t.type}
                    style={[
                      styles.typeCard,
                      type === t.type && styles.typeCardActive,
                      photo && styles.typeCardDark,
                      type === t.type && photo && styles.typeCardActiveDark,
                    ]}
                    onPress={() => {
                      setType(t.type);
                      Haptics.selectionAsync();
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.typeCardEmoji}>{t.emoji}</Text>
                    <Text style={[styles.typeCardLabel, photo && { color: '#fff' }, type === t.type && { color: photo ? '#fff' : Colors.pine }]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={styles.nextBtn}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); animateNext('where'); }}
              >
                <Text style={styles.nextBtnText}>Continue →</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}

        {/* STEP: WHERE */}
        {step === 'where' && (
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <View style={styles.writeStep}>
              <Text style={[styles.stepHeading, photo && styles.stepHeadingLight]}>
                Where is this?
              </Text>
              <Text style={[styles.stepSub, photo && styles.stepSubLight]}>
                A name, a street, or just the neighbourhood.
              </Text>
              <TextInput
                style={[styles.nameInput, photo && styles.inputDark]}
                placeholder="e.g. La Habichuela, Centro Histórico"
                placeholderTextColor={photo ? 'rgba(255,255,255,0.4)' : Colors.muted}
                value={name}
                onChangeText={setName}
                autoFocus
                returnKeyType="next"
                onSubmitEditing={() => animateNext('write')}
              />
              <TextInput
                style={[styles.locationInput, photo && styles.inputDark]}
                placeholder="Area or address (optional)"
                placeholderTextColor={photo ? 'rgba(255,255,255,0.4)' : Colors.muted}
                value={location}
                onChangeText={setLocation}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[styles.nextBtn, !name && styles.nextBtnDisabled]}
                onPress={() => {
                  if (!name.trim()) return;
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  animateNext('write');
                }}
              >
                <Text style={styles.nextBtnText}>Continue →</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}

        {/* STEP: WRITE — the journal step */}
        {step === 'write' && (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            <View style={styles.writeStep}>
              <Text style={[styles.journalPrompt, photo && styles.journalPromptLight]}>
                {currentPrompt}
              </Text>
              <TextInput
                style={[styles.journalInput, photo && styles.journalInputDark]}
                placeholder="Write anything. Stream of consciousness is fine. This isn't a review — it's a memory."
                placeholderTextColor={photo ? 'rgba(255,255,255,0.35)' : '#C0BAB2'}
                value={review}
                onChangeText={setReview}
                multiline
                autoFocus
                textAlignVertical="top"
                scrollEnabled={false}
              />
              <Text style={[styles.journalHint, photo && { color: 'rgba(255,255,255,0.4)' }]}>
                {review.length > 0 ? `${review.length} chars` : 'No minimum. No maximum.'}
              </Text>
              <TouchableOpacity
                style={styles.nextBtn}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  animateNext('rate');
                }}
              >
                <Text style={styles.nextBtnText}>
                  {review.trim() ? 'Continue →' : 'Skip writing →'}
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}

        {/* STEP: RATE */}
        {step === 'rate' && (
          <View style={styles.rateStep}>
            <Text style={[styles.stepHeading, photo && styles.stepHeadingLight]}>
              One last thing.
            </Text>
            <Text style={[styles.stepSub, photo && styles.stepSubLight]}>
              How would you rate {name || 'this'}?
            </Text>
            <View style={styles.ratingWrap}>
              <StarRating
                rating={rating}
                size={52}
                interactive
                onRate={(r) => {
                  setRating(r);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }}
              />
              {rating > 0 && (
                <Text style={[styles.ratingWord, photo && { color: '#fff' }]}>
                  {['', 'Skip it', 'Okay', 'Worth it', 'Really good', 'Essential'][rating]}
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={[styles.nextBtn, rating === 0 && styles.nextBtnDisabled]}
              onPress={() => {
                if (rating === 0) return;
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                animateNext('preview');
              }}
            >
              <Text style={styles.nextBtnText}>Preview →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP: PREVIEW — the "creation moment" */}
        {step === 'preview' && (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.previewScroll}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.previewLabel, photo && { color: 'rgba(255,255,255,0.6)' }]}>
              This is how it looks to your friends
            </Text>

            {/* Memory card preview */}
            <View style={styles.previewCard}>
              {photo ? (
                <Image source={{ uri: photo }} style={styles.previewPhoto} />
              ) : (
                <View style={[styles.previewPhotoFallback, { backgroundColor: TypeColors[type] + '30' }]}>
                  <Text style={{ fontSize: 48 }}>{TypeEmojis[type]}</Text>
                </View>
              )}

              <View style={styles.previewBody}>
                <View style={styles.previewTypeRow}>
                  <View style={[styles.previewTypeBadge, { backgroundColor: TypeBgColors[type] }]}>
                    <Text style={styles.previewTypeBadgeText}>
                      {TypeEmojis[type]} {type}
                    </Text>
                  </View>
                  <StarRating rating={rating} size={14} />
                </View>

                <Text style={styles.previewName}>{name || 'Untitled memory'}</Text>

                {location ? (
                  <Text style={styles.previewLocation}>📍 {location}</Text>
                ) : null}

                {review ? (
                  <Text style={styles.previewReview} numberOfLines={4}>{review}</Text>
                ) : null}

                <View style={styles.previewFooter}>
                  <View style={styles.previewAvatar}>
                    <Text style={styles.previewAvatarText}>AJ</Text>
                  </View>
                  <Text style={styles.previewAuthor}>You · just now</Text>
                </View>
              </View>
            </View>

            {/* Save button */}
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.88}>
              <Text style={styles.saveBtnText}>Save memory ✦</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => animateNext('write')}
              style={styles.editBtn}
            >
              <Text style={styles.editBtnText}>Edit before saving</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bgPhoto: {
    ...StyleSheet.absoluteFillObject,
    width: W, height: H,
  },
  overlay: { ...StyleSheet.absoluteFillObject },

  // Progress
  progressBar: {
    position: 'absolute', left: 0, right: 0, zIndex: 10,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
  },
  progressTrack: {
    flex: 1, height: 3, backgroundColor: 'rgba(0,0,0,0.12)',
    borderRadius: 2, overflow: 'hidden',
  },
  progressFill: { height: 3, backgroundColor: Colors.pine, borderRadius: 2 },
  backBtn: { padding: 8 },
  backArrow: { fontSize: 20, color: Colors.ink },
  closeBtn: { padding: 8 },
  closeX: { fontSize: 16, color: Colors.muted },

  // Content container
  content: { flex: 1, paddingHorizontal: Spacing.xl },

  // Photo step
  photoStep: { flex: 1, justifyContent: 'center', paddingBottom: 60 },
  stepHeading: {
    fontSize: 28, fontWeight: '800', color: Colors.ink,
    letterSpacing: -0.5, marginBottom: Spacing.sm,
  },
  stepHeadingLight: { color: '#fff' },
  stepSub: { fontSize: 15, color: Colors.muted, marginBottom: Spacing.xxxl, lineHeight: 22 },
  stepSubLight: { color: 'rgba(255,255,255,0.65)' },
  photoActions: { gap: Spacing.md, marginBottom: Spacing.xl },
  photoBtnPrimary: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.pine, borderRadius: Radius.lg,
    paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xl,
  },
  photoBtnIcon: { fontSize: 22 },
  photoBtnLabel: { fontSize: 16, fontWeight: '700', color: '#fff' },
  skipBtn: { alignSelf: 'center', padding: Spacing.md },
  skipText: { fontSize: 14, color: Colors.muted, textDecorationLine: 'underline' },

  // Type step
  typeStep: { flex: 1, justifyContent: 'center', paddingBottom: 40 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xl },
  typeCard: {
    width: (W - Spacing.xl * 2 - Spacing.sm * 2) / 3,
    alignItems: 'center', paddingVertical: Spacing.lg,
    borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: 'rgba(255,255,255,0.9)', gap: 6,
  },
  typeCardActive: { borderColor: Colors.pine, backgroundColor: '#EDF3E8' },
  typeCardDark: { backgroundColor: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.2)' },
  typeCardActiveDark: { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.25)' },
  typeCardEmoji: { fontSize: 26 },
  typeCardLabel: { fontSize: 11, fontWeight: '700', color: Colors.muted, textAlign: 'center' },

  // Where + write shared
  writeStep: { flex: 1, paddingTop: Spacing.lg, paddingBottom: 40 },
  nameInput: {
    fontSize: 22, fontWeight: '700', color: Colors.ink,
    paddingVertical: Spacing.md, borderBottomWidth: 2,
    borderBottomColor: Colors.pine, marginBottom: Spacing.md,
    backgroundColor: 'transparent',
  },
  locationInput: {
    fontSize: 15, color: Colors.muted,
    paddingVertical: Spacing.sm, borderBottomWidth: 1,
    borderBottomColor: Colors.border, marginBottom: Spacing.xl,
    backgroundColor: 'transparent',
  },
  inputDark: { color: '#fff', borderBottomColor: 'rgba(255,255,255,0.5)' },

  // Journal write step
  journalPrompt: {
    fontSize: 22, fontWeight: '700', color: Colors.ink,
    letterSpacing: -0.3, marginBottom: Spacing.xl, lineHeight: 30,
  },
  journalPromptLight: { color: '#fff' },
  journalInput: {
    fontSize: 17, color: Colors.ink, lineHeight: 26,
    minHeight: 180, backgroundColor: 'transparent',
    marginBottom: Spacing.sm,
  },
  journalInputDark: { color: '#fff' },
  journalHint: {
    fontSize: 12, color: Colors.muted, marginBottom: Spacing.xl,
  },

  // Rate step
  rateStep: { flex: 1, justifyContent: 'center', paddingBottom: 60 },
  ratingWrap: { alignItems: 'center', marginVertical: Spacing.xxxl, gap: Spacing.lg },
  ratingWord: {
    fontSize: 20, fontWeight: '800', color: Colors.ink, letterSpacing: -0.3,
  },

  // Next button (shared)
  nextBtn: {
    backgroundColor: Colors.pine, borderRadius: Radius.full,
    paddingVertical: Spacing.md, alignItems: 'center',
  },
  nextBtnDisabled: { opacity: 0.35 },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Preview step
  previewScroll: { paddingBottom: 60, paddingTop: Spacing.lg },
  previewLabel: {
    fontSize: 12, fontWeight: '700', color: Colors.muted,
    textTransform: 'uppercase', letterSpacing: 1,
    textAlign: 'center', marginBottom: Spacing.lg,
  },
  previewCard: {
    backgroundColor: Colors.card, borderRadius: Radius.xl,
    overflow: 'hidden', marginBottom: Spacing.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 8,
  },
  previewPhoto: { width: '100%', height: 220, resizeMode: 'cover' },
  previewPhotoFallback: {
    width: '100%', height: 160,
    alignItems: 'center', justifyContent: 'center',
  },
  previewBody: { padding: Spacing.lg },
  previewTypeRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: Spacing.sm,
  },
  previewTypeBadge: {
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
    borderRadius: Radius.full,
  },
  previewTypeBadgeText: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  previewName: {
    fontSize: 20, fontWeight: '800', color: Colors.ink,
    letterSpacing: -0.3, marginBottom: 4,
  },
  previewLocation: { fontSize: 12, color: Colors.muted, marginBottom: Spacing.sm },
  previewReview: {
    fontSize: 14, color: '#444', lineHeight: 21, marginBottom: Spacing.md,
  },
  previewFooter: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  previewAvatar: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.pine, alignItems: 'center', justifyContent: 'center',
  },
  previewAvatarText: { fontSize: 9, fontWeight: '800', color: '#fff' },
  previewAuthor: { fontSize: 12, color: Colors.muted, fontWeight: '500' },

  // Save
  saveBtn: {
    backgroundColor: Colors.pine, borderRadius: Radius.full,
    paddingVertical: Spacing.lg, alignItems: 'center', marginBottom: Spacing.md,
  },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
  editBtn: { alignSelf: 'center', padding: Spacing.md },
  editBtnText: { fontSize: 14, color: Colors.muted, textDecorationLine: 'underline' },
});
