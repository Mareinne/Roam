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
import {
  Colors, Spacing, Radius, TypeEmojis, TypeColors,
  TypeBgColors, MoodEmojis, MoodColors,
} from '../theme';
import { ExperienceType, Mood } from '../types';

const { width: W, height: H } = Dimensions.get('window');

type Step = 'context' | 'photo' | 'type' | 'where' | 'write' | 'rate' | 'preview';

const TYPES: { type: ExperienceType; emoji: string; label: string }[] = [
  { type: 'food',      emoji: '🍽', label: 'Food & Drinks' },
  { type: 'nightlife', emoji: '🌙', label: 'Nightlife' },
  { type: 'event',     emoji: '🎟', label: 'Event' },
  { type: 'culture',   emoji: '🎭', label: 'Culture' },
  { type: 'nature',    emoji: '🌿', label: 'Nature' },
  { type: 'everyday',  emoji: '✦',  label: 'Everyday moment' },
  { type: 'tip',       emoji: '💡', label: 'Local Tip' },
  { type: 'stay',      emoji: '🏨', label: 'Stay' },
];

const MOODS: Mood[] = ['loved it', 'solid', 'meh', 'skip it'];

// Write-step prompts vary by type AND context
const PROMPTS: Record<ExperienceType, Record<'hometown' | 'travel', string[]>> = {
  food: {
    hometown: [
      'What made it worth going back to?',
      'Is this your new go-to? Why?',
      'Describe it like you\'re texting a friend who\'s about to go.',
    ],
    travel: [
      'What made the meal worth remembering?',
      'What should they order first?',
      'Why this place over anywhere else in the city?',
    ],
  },
  nightlife: {
    hometown: [
      'Set the scene. Who goes? What\'s the vibe at midnight?',
      'Is this a hidden gem or is everyone there already?',
      'What\'s the move — first drink, last drink, or both?',
    ],
    travel: [
      'How does it compare to back home?',
      'What time to arrive, what to expect?',
      'What did you do after?',
    ],
  },
  event: {
    hometown: [
      'Worth it? Would you go again?',
      'What surprised you — good or bad?',
      'Practical tips for anyone who goes next time.',
    ],
    travel: [
      'What\'s the context someone needs to appreciate this?',
      'How did it feel to experience this while traveling?',
      'Would you time a trip around this?',
    ],
  },
  culture: {
    hometown: [
      'Why did this one finally make you go?',
      'What do most locals miss about this place?',
      'Free or paid? Worth it either way?',
    ],
    travel: [
      'Why did this one stick with you?',
      'What surprised you about it?',
      'What\'s the context someone needs to appreciate it?',
    ],
  },
  nature: {
    hometown: [
      'Is this your weekend ritual now?',
      'What time of day, what season?',
      'Secret spot or everyone knows?',
    ],
    travel: [
      'What did it feel like to be there?',
      'What time of day was best?',
      'What would you tell someone before they go?',
    ],
  },
  everyday: {
    hometown: [
      'What made this Tuesday/Wednesday/Thursday worth logging?',
      'What made this feel different from a regular day?',
      'Would you do this again next week?',
    ],
    travel: [
      'The kind of thing only locals do?',
      'How did you find this?',
      'What did it tell you about the city?',
    ],
  },
  tip: {
    hometown: [
      'What do your friends always ask you about this?',
      'The thing everyone does wrong vs. what you know now?',
      'How does knowing this change someone\'s experience?',
    ],
    travel: [
      'What do most visitors miss?',
      'What\'s the insider version of this?',
      'How does knowing this change the trip?',
    ],
  },
  stay: {
    hometown: [
      'Who would you send here? A friend visiting, or for yourself?',
      'First impression vs. after a night?',
      'What\'s the neighbourhood like?',
    ],
    travel: [
      'First impression vs. after a few nights?',
      'What\'s the room / vibe actually like?',
      'Who is this perfect for?',
    ],
  },
};

export function LogScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const addExperience = useRoamStore((s) => s.addExperience);

  const [step, setStep] = useState<Step>('context');
  const [isHometown, setIsHometown] = useState(true);
  const [photo, setPhoto] = useState<string | null>(null);
  const [type, setType] = useState<ExperienceType>('food');
  const [location, setLocation] = useState('');
  const [name, setName] = useState('');
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(0);
  const [mood, setMood] = useState<Mood | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const ctx = isHometown ? 'hometown' : 'travel';
  const prompts = PROMPTS[type][ctx];
  const prompt = prompts[Math.floor(Math.random() * prompts.length)];

  const animateNext = (next: Step) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }).start(() => {
      setStep(next);
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  };

  const goBack = () => {
    const order: Step[] = ['context', 'photo', 'type', 'where', 'write', 'rate', 'preview'];
    const idx = order.indexOf(step);
    if (idx > 0) animateNext(order[idx - 1]);
    else navigation.goBack();
  };

  const pickPhoto = async (fromCamera = false) => {
    const fn = fromCamera
      ? ImagePicker.launchCameraAsync
      : ImagePicker.launchImageLibraryAsync;
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') return;
    const result = await fn({ quality: 0.85, allowsEditing: true, aspect: [4, 5],
      mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      animateNext('type');
    }
  };

  const handleSave = () => {
    const exp = {
      id: Date.now().toString(),
      name: name.trim() || location.trim() || 'Untitled',
      type,
      location: location.trim() || (isHometown ? 'San Francisco' : 'Unknown'),
      city: isHometown ? 'San Francisco' : 'Cancún',
      country: isHometown ? 'USA' : 'Mexico',
      latitude: isHometown ? 37.77 + Math.random() * 0.05 : 21.1 + Math.random() * 0.1,
      longitude: isHometown ? -122.43 + Math.random() * 0.05 : -86.85 + Math.random() * 0.1,
      rating,
      mood: mood ?? undefined,
      review: review.trim(),
      photos: photo ? [photo] : [],
      friendId: 'mia',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      isHometown,
      weekend: [0, 6].includes(new Date().getDay()),
    };
    addExperience(exp);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.goBack();
  };

  const progress = ['context', 'photo', 'type', 'where', 'write', 'rate', 'preview'].indexOf(step) / 6;
  const hasPhoto = !!photo;

  return (
    <View style={styles.root}>
      {hasPhoto ? (
        <Image source={{ uri: photo! }} style={styles.bgPhoto} />
      ) : (
        <View style={[styles.bgPhoto, { backgroundColor: isHometown ? '#F0EAE0' : TypeBgColors[type] + '40' }]} />
      )}
      <View style={[styles.overlay, { backgroundColor: hasPhoto ? 'rgba(0,0,0,0.5)' : 'rgba(253,250,245,0.96)' }]} />

      {/* Progress + nav */}
      <View style={[styles.topBar, { paddingTop: insets.top + 4 }]}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn}>
          <Text style={[styles.backArrow, hasPhoto && { color: '#fff' }]}>←</Text>
        </TouchableOpacity>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Text style={[styles.closeX, hasPhoto && { color: 'rgba(255,255,255,0.7)' }]}>✕</Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim, paddingTop: insets.top + 52 }]}>

        {/* ── STEP: CONTEXT ─────────────────────────────────────────── */}
        {step === 'context' && (
          <View style={styles.centeredStep}>
            <Text style={styles.heading}>What are you logging?</Text>
            <Text style={styles.sub}>Roam is for everything — travel and everyday life.</Text>

            <TouchableOpacity
              style={[styles.contextCard, isHometown && styles.contextCardActive]}
              onPress={() => { setIsHometown(true); Haptics.selectionAsync(); }}
              activeOpacity={0.85}
            >
              <Text style={styles.contextEmoji}>🏠</Text>
              <View style={styles.contextText}>
                <Text style={[styles.contextTitle, isHometown && { color: Colors.pine }]}>
                  Something in my city
                </Text>
                <Text style={styles.contextSub}>
                  A restaurant, bar, hike, event, random Thursday — anything local
                </Text>
              </View>
              {isHometown && <Text style={styles.contextCheck}>✓</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contextCard, !isHometown && styles.contextCardActive]}
              onPress={() => { setIsHometown(false); Haptics.selectionAsync(); }}
              activeOpacity={0.85}
            >
              <Text style={styles.contextEmoji}>✈️</Text>
              <View style={styles.contextText}>
                <Text style={[styles.contextTitle, !isHometown && { color: Colors.pine }]}>
                  Something while traveling
                </Text>
                <Text style={styles.contextSub}>
                  A trip, a city I'm visiting, somewhere away from home
                </Text>
              </View>
              {!isHometown && <Text style={styles.contextCheck}>✓</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.nextBtn}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); animateNext('photo'); }}
            >
              <Text style={styles.nextBtnText}>Continue →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── STEP: PHOTO ───────────────────────────────────────────── */}
        {step === 'photo' && (
          <View style={styles.centeredStep}>
            <Text style={styles.heading}>Add a photo.</Text>
            <Text style={styles.sub}>
              {isHometown
                ? 'Even a quick snap makes the memory stick.'
                : 'Every great travel memory deserves one.'}
            </Text>
            <TouchableOpacity style={styles.photoBtnPrimary} onPress={() => pickPhoto(true)}>
              <Text style={styles.photoBtnIcon}>📷</Text>
              <Text style={styles.photoBtnLabel}>Take photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.photoBtnPrimary, { marginTop: Spacing.md }]} onPress={() => pickPhoto(false)}>
              <Text style={styles.photoBtnIcon}>🖼</Text>
              <Text style={styles.photoBtnLabel}>Choose from library</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => animateNext('type')} style={styles.skipBtn}>
              <Text style={styles.skipText}>Skip — log without a photo</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── STEP: TYPE ────────────────────────────────────────────── */}
        {step === 'type' && (
          <View style={styles.typeStep}>
            <Text style={[styles.heading, hasPhoto && styles.headingLight]}>What kind?</Text>
            <View style={styles.typeGrid}>
              {TYPES.map((t) => (
                <TouchableOpacity
                  key={t.type}
                  style={[
                    styles.typeCard,
                    type === t.type && styles.typeCardActive,
                    hasPhoto && styles.typeCardDark,
                    type === t.type && hasPhoto && styles.typeCardActiveDark,
                  ]}
                  onPress={() => { setType(t.type); Haptics.selectionAsync(); }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.typeEmoji}>{t.emoji}</Text>
                  <Text style={[styles.typeLabel, hasPhoto && { color: '#fff' }, type === t.type && { color: hasPhoto ? '#fff' : Colors.pine }]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.nextBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); animateNext('where'); }}>
              <Text style={styles.nextBtnText}>Continue →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── STEP: WHERE ───────────────────────────────────────────── */}
        {step === 'where' && (
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <View style={styles.writeStep}>
              <Text style={[styles.heading, hasPhoto && styles.headingLight]}>Where?</Text>
              <Text style={[styles.sub, hasPhoto && styles.subLight]}>
                {isHometown
                  ? 'Name of the place, street, or neighbourhood.'
                  : 'Name + area — be specific so friends can find it.'}
              </Text>
              <TextInput
                style={[styles.nameInput, hasPhoto && styles.inputLight]}
                placeholder={isHometown ? 'e.g. Zazie, Cole Valley' : 'e.g. La Habichuela, Centro'}
                placeholderTextColor={hasPhoto ? 'rgba(255,255,255,0.4)' : Colors.muted}
                value={name} onChangeText={setName}
                autoFocus returnKeyType="next"
                onSubmitEditing={() => animateNext('write')}
              />
              <TextInput
                style={[styles.locationInput, hasPhoto && styles.inputLight]}
                placeholder={isHometown ? 'Neighbourhood / address (optional)' : 'City / area (optional)'}
                placeholderTextColor={hasPhoto ? 'rgba(255,255,255,0.4)' : Colors.muted}
                value={location} onChangeText={setLocation}
              />
              <TouchableOpacity
                style={[styles.nextBtn, !name && styles.nextBtnDisabled]}
                onPress={() => { if (!name.trim()) return; Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); animateNext('write'); }}
              >
                <Text style={styles.nextBtnText}>Continue →</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}

        {/* ── STEP: WRITE ───────────────────────────────────────────── */}
        {step === 'write' && (
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <View style={styles.writeStep}>
              <Text style={[styles.journalPrompt, hasPhoto && styles.headingLight]}>{prompt}</Text>
              <TextInput
                style={[styles.journalInput, hasPhoto && styles.journalInputLight]}
                placeholder="Write anything. This isn't a review — it's a memory."
                placeholderTextColor={hasPhoto ? 'rgba(255,255,255,0.3)' : '#C0BAB2'}
                value={review} onChangeText={setReview}
                multiline autoFocus textAlignVertical="top" scrollEnabled={false}
              />
              <Text style={[styles.hint, hasPhoto && { color: 'rgba(255,255,255,0.4)' }]}>
                {review.length > 0 ? `${review.length} chars · no limit` : 'No minimum. No maximum.'}
              </Text>
              <TouchableOpacity
                style={styles.nextBtn}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); animateNext('rate'); }}
              >
                <Text style={styles.nextBtnText}>{review.trim() ? 'Continue →' : 'Skip →'}</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}

        {/* ── STEP: RATE ────────────────────────────────────────────── */}
        {step === 'rate' && (
          <View style={styles.centeredStep}>
            <Text style={[styles.heading, hasPhoto && styles.headingLight]}>How was it?</Text>

            {/* Mood first — quick gut-check */}
            <View style={styles.moodRow}>
              {MOODS.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.moodBtn,
                    mood === m && { backgroundColor: MoodColors[m], borderColor: MoodColors[m] },
                    hasPhoto && styles.moodBtnDark,
                  ]}
                  onPress={() => { setMood(m); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.moodEmoji}>{MoodEmojis[m]}</Text>
                  <Text style={[styles.moodLabel, mood === m && { color: '#fff' }, hasPhoto && mood !== m && { color: '#fff' }]}>
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Stars — secondary, more nuanced */}
            <Text style={[styles.starsLabel, hasPhoto && { color: 'rgba(255,255,255,0.6)' }]}>
              Rate it out of 5
            </Text>
            <View style={styles.starsRow}>
              <StarRating
                rating={rating} size={44} interactive
                onRate={(r) => { setRating(r); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
              />
            </View>
            {rating > 0 && (
              <Text style={[styles.ratingWord, hasPhoto && { color: '#fff' }]}>
                {['', 'Skip it', 'Okay', 'Worth it', 'Really good', 'Essential'][rating]}
              </Text>
            )}

            <TouchableOpacity
              style={[styles.nextBtn, { marginTop: Spacing.xl }, (!mood && rating === 0) && styles.nextBtnDisabled]}
              onPress={() => {
                if (!mood && rating === 0) return;
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                animateNext('preview');
              }}
            >
              <Text style={styles.nextBtnText}>Preview →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── STEP: PREVIEW ─────────────────────────────────────────── */}
        {step === 'preview' && (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.previewScroll} showsVerticalScrollIndicator={false}>
            <Text style={[styles.previewLabel, hasPhoto && { color: 'rgba(255,255,255,0.5)' }]}>
              This is how your friends will see it
            </Text>

            <View style={styles.previewCard}>
              {photo ? (
                <Image source={{ uri: photo }} style={styles.previewPhoto} />
              ) : (
                <View style={[styles.previewFallback, { backgroundColor: TypeBgColors[type] }]}>
                  <Text style={{ fontSize: 44 }}>{TypeEmojis[type]}</Text>
                  {isHometown && <Text style={styles.previewHometownBadge}>🏠 Hometown</Text>}
                </View>
              )}
              <View style={styles.previewBody}>
                <View style={styles.previewMeta}>
                  {mood && (
                    <View style={[styles.previewMoodPill, { backgroundColor: MoodColors[mood] + '20' }]}>
                      <Text style={[styles.previewMoodText, { color: MoodColors[mood] }]}>
                        {MoodEmojis[mood]} {mood}
                      </Text>
                    </View>
                  )}
                  {rating > 0 && <StarRating rating={rating} size={14} />}
                </View>
                <Text style={styles.previewName}>{name || 'Untitled memory'}</Text>
                {location ? <Text style={styles.previewLoc}>📍 {location}</Text> : null}
                {review ? <Text style={styles.previewReview} numberOfLines={4}>{review}</Text> : null}
                <View style={styles.previewFooter}>
                  <View style={styles.previewAv}>
                    <Text style={styles.previewAvText}>AJ</Text>
                  </View>
                  <Text style={styles.previewAuthor}>You · just now · {isHometown ? 'Hometown' : 'Travel'}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.88}>
              <Text style={styles.saveBtnText}>Save memory ✦</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => animateNext('write')} style={styles.editBtn}>
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
  bgPhoto: { ...StyleSheet.absoluteFillObject, width: W, height: H },
  overlay: { ...StyleSheet.absoluteFillObject },
  topBar: {
    position: 'absolute', left: 0, right: 0, zIndex: 10,
    paddingHorizontal: Spacing.lg, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
  },
  backBtn: { padding: 8 },
  backArrow: { fontSize: 20, color: Colors.ink },
  progressTrack: { flex: 1, height: 3, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 3, backgroundColor: Colors.pine, borderRadius: 2 },
  closeBtn: { padding: 8 },
  closeX: { fontSize: 16, color: Colors.muted },
  content: { flex: 1, paddingHorizontal: Spacing.xl },

  // Shared
  heading: { fontSize: 26, fontWeight: '800', color: Colors.ink, letterSpacing: -0.5, marginBottom: Spacing.sm },
  headingLight: { color: '#fff' },
  sub: { fontSize: 15, color: Colors.muted, marginBottom: Spacing.xl, lineHeight: 22 },
  subLight: { color: 'rgba(255,255,255,0.6)' },
  nextBtn: { backgroundColor: Colors.pine, borderRadius: Radius.full, paddingVertical: Spacing.md, alignItems: 'center', marginTop: Spacing.xl },
  nextBtnDisabled: { opacity: 0.35 },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Context step
  centeredStep: { flex: 1, justifyContent: 'center', paddingBottom: 60 },
  contextCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.card, borderRadius: Radius.lg,
    padding: Spacing.lg, borderWidth: 1.5, borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  contextCardActive: { borderColor: Colors.pine, backgroundColor: '#EDF3E8' },
  contextEmoji: { fontSize: 28 },
  contextText: { flex: 1 },
  contextTitle: { fontSize: 15, fontWeight: '700', color: Colors.ink, marginBottom: 3 },
  contextSub: { fontSize: 12, color: Colors.muted, lineHeight: 17 },
  contextCheck: { fontSize: 18, color: Colors.pine, fontWeight: '700' },

  // Photo step
  photoBtnPrimary: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.pine, borderRadius: Radius.lg,
    paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xl,
  },
  photoBtnIcon: { fontSize: 22 },
  photoBtnLabel: { fontSize: 16, fontWeight: '700', color: '#fff' },
  skipBtn: { alignSelf: 'center', padding: Spacing.md, marginTop: Spacing.sm },
  skipText: { fontSize: 14, color: Colors.muted, textDecorationLine: 'underline' },

  // Type step
  typeStep: { flex: 1, paddingTop: Spacing.lg, paddingBottom: 40 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  typeCard: {
    width: (W - Spacing.xl * 2 - Spacing.sm * 2) / 3,
    alignItems: 'center', paddingVertical: Spacing.md,
    borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: 'rgba(255,255,255,0.9)', gap: 4,
  },
  typeCardActive: { borderColor: Colors.pine, backgroundColor: '#EDF3E8' },
  typeCardDark: { backgroundColor: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.2)' },
  typeCardActiveDark: { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.25)' },
  typeEmoji: { fontSize: 24 },
  typeLabel: { fontSize: 10, fontWeight: '700', color: Colors.muted, textAlign: 'center' },

  // Write step
  writeStep: { flex: 1, paddingTop: Spacing.lg, paddingBottom: 40 },
  nameInput: {
    fontSize: 21, fontWeight: '700', color: Colors.ink,
    paddingVertical: Spacing.md, borderBottomWidth: 2, borderBottomColor: Colors.pine,
    marginBottom: Spacing.md, backgroundColor: 'transparent',
  },
  locationInput: {
    fontSize: 15, color: Colors.muted,
    paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border,
    marginBottom: Spacing.xl, backgroundColor: 'transparent',
  },
  inputLight: { color: '#fff', borderBottomColor: 'rgba(255,255,255,0.5)' },
  journalPrompt: {
    fontSize: 20, fontWeight: '700', color: Colors.ink,
    letterSpacing: -0.3, marginBottom: Spacing.xl, lineHeight: 28,
  },
  journalInput: {
    fontSize: 17, color: Colors.ink, lineHeight: 26,
    minHeight: 160, backgroundColor: 'transparent', marginBottom: Spacing.sm,
  },
  journalInputLight: { color: '#fff' },
  hint: { fontSize: 12, color: Colors.muted, marginBottom: Spacing.xl },

  // Rate step
  moodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xl },
  moodBtn: {
    flex: 1, minWidth: '45%', flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  moodBtnDark: { backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.25)' },
  moodEmoji: { fontSize: 20 },
  moodLabel: { fontSize: 14, fontWeight: '600', color: Colors.ink },
  starsLabel: { fontSize: 13, color: Colors.muted, fontWeight: '600', marginBottom: Spacing.md },
  starsRow: { alignItems: 'center', marginBottom: Spacing.sm },
  ratingWord: { fontSize: 18, fontWeight: '800', color: Colors.ink, textAlign: 'center', letterSpacing: -0.3 },

  // Preview step
  previewScroll: { paddingBottom: 60, paddingTop: Spacing.lg },
  previewLabel: {
    fontSize: 11, fontWeight: '700', color: Colors.muted,
    textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center', marginBottom: Spacing.lg,
  },
  previewCard: {
    backgroundColor: Colors.card, borderRadius: Radius.xl, overflow: 'hidden',
    marginBottom: Spacing.lg, shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 6,
  },
  previewPhoto: { width: '100%', height: 200, resizeMode: 'cover' },
  previewFallback: {
    width: '100%', height: 130, alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  previewHometownBadge: { fontSize: 12, fontWeight: '700', color: Colors.muted },
  previewBody: { padding: Spacing.lg },
  previewMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  previewMoodPill: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.full },
  previewMoodText: { fontSize: 12, fontWeight: '700' },
  previewName: { fontSize: 19, fontWeight: '800', color: Colors.ink, letterSpacing: -0.3, marginBottom: 4 },
  previewLoc: { fontSize: 12, color: Colors.muted, marginBottom: Spacing.sm },
  previewReview: { fontSize: 14, color: '#444', lineHeight: 21, marginBottom: Spacing.md },
  previewFooter: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  previewAv: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.pine,
    alignItems: 'center', justifyContent: 'center',
  },
  previewAvText: { fontSize: 8, fontWeight: '800', color: '#fff' },
  previewAuthor: { fontSize: 11, color: Colors.muted, fontWeight: '500' },
  saveBtn: {
    backgroundColor: Colors.pine, borderRadius: Radius.full,
    paddingVertical: Spacing.lg, alignItems: 'center', marginBottom: Spacing.md,
  },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
  editBtn: { alignSelf: 'center', padding: Spacing.md },
  editBtnText: { fontSize: 14, color: Colors.muted, textDecorationLine: 'underline' },
});
