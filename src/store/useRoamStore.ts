import { create } from 'zustand';
import { Experience, Friend, FilterType, SortType, Echo, Trip, DetectedCity } from '../types';
import { SEED_EXPERIENCES, SEED_FRIENDS } from '../data/seed';

interface RoamStore {
  experiences: Experience[];
  friends: Friend[];
  activeFilter: FilterType;
  activeFriendIds: Set<string>;
  sortType: SortType;
  selectedExperienceId: string | null;

  // Trip detection
  detectedCity: DetectedCity | null;
  plannedTrips: Trip[];
  activePreTrip: Trip | null;

  // Actions
  setFilter: (filter: FilterType) => void;
  toggleFriend: (friendId: string) => void;
  setSort: (sort: SortType) => void;
  selectExperience: (id: string | null) => void;
  addExperience: (exp: Experience) => void;
  toggleFollowFriend: (friendId: string) => void;

  // Trip detection
  setDetectedCity: (city: DetectedCity | null) => void;
  markCityPrompted: () => void;
  addPlannedTrip: (trip: Trip) => void;
  removePlannedTrip: (id: string) => void;
  setActivePreTrip: (trip: Trip | null) => void;

  // Echo
  addEcho: (echo: Echo) => void;
  getEchosForExperience: (experienceId: string) => Echo[];

  // Selectors
  getVisibleExperiences: () => Experience[];
  getExperiencesForCity: (city: string) => Experience[];
  getFriendById: (id: string) => Friend | undefined;
  getFriendWeight: (experienceId: string) => number;
}

export const useRoamStore = create<RoamStore>((set, get) => ({
  experiences: SEED_EXPERIENCES,
  friends: SEED_FRIENDS,
  activeFilter: 'all',
  activeFriendIds: new Set(['all']),
  sortType: 'rating',
  selectedExperienceId: null,
  detectedCity: null,
  plannedTrips: [],
  activePreTrip: null,

  setFilter: (filter) => set({ activeFilter: filter }),

  toggleFriend: (friendId) => {
    const current = new Set(get().activeFriendIds);
    if (friendId === 'all') {
      set({ activeFriendIds: new Set(['all']) });
      return;
    }
    current.delete('all');
    if (current.has(friendId)) {
      current.delete(friendId);
      if (current.size === 0) current.add('all');
    } else {
      current.add(friendId);
    }
    set({ activeFriendIds: current });
  },

  setSort: (sort) => set({ sortType: sort }),
  selectExperience: (id) => set({ selectedExperienceId: id }),

  addExperience: (exp) =>
    set((state) => ({ experiences: [exp, ...state.experiences] })),

  toggleFollowFriend: (friendId) =>
    set((state) => ({
      friends: state.friends.map((f) =>
        f.id === friendId ? { ...f, isFollowing: !f.isFollowing } : f
      ),
    })),

  // Trip detection
  setDetectedCity: (city) => set({ detectedCity: city }),

  markCityPrompted: () =>
    set((state) => ({
      detectedCity: state.detectedCity
        ? { ...state.detectedCity, hasPrompted: true }
        : null,
    })),

  addPlannedTrip: (trip) =>
    set((state) => ({ plannedTrips: [trip, ...state.plannedTrips] })),

  removePlannedTrip: (id) =>
    set((state) => ({
      plannedTrips: state.plannedTrips.filter((t) => t.id !== id),
    })),

  setActivePreTrip: (trip) => set({ activePreTrip: trip }),

  // Echo
  addEcho: (echo) =>
    set((state) => ({
      experiences: state.experiences.map((exp) =>
        exp.id === echo.experienceId
          ? { ...exp, echoes: [...(exp.echoes || []), echo] }
          : exp
      ),
    })),

  getEchosForExperience: (experienceId) => {
    const exp = get().experiences.find((e) => e.id === experienceId);
    return exp?.echoes || [];
  },

  // Friend-weight score: original rating + average echo rating, weighted by number of echoes
  getFriendWeight: (experienceId) => {
    const exp = get().experiences.find((e) => e.id === experienceId);
    if (!exp) return 0;
    const echoes = exp.echoes || [];
    if (echoes.length === 0) return exp.rating;
    const echoAvg = echoes.reduce((sum, e) => sum + e.rating, 0) / echoes.length;
    // Blend: original 60%, echoes 40%, boosted by echo count
    const boost = Math.min(echoes.length * 0.1, 0.5);
    return exp.rating * (0.6 - boost / 2) + echoAvg * (0.4 + boost / 2);
  },

  getVisibleExperiences: () => {
    const { experiences, activeFilter, activeFriendIds, sortType } = get();
    let filtered = experiences.filter((e) => {
      const typeMatch = activeFilter === 'all' || e.type === activeFilter;
      const friendMatch = activeFriendIds.has('all') || activeFriendIds.has(e.friendId);
      return typeMatch && friendMatch;
    });

    if (sortType === 'rating') {
      filtered = [...filtered].sort((a, b) => b.rating - a.rating);
    } else if (sortType === 'recent') {
      filtered = [...filtered].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortType === 'friend') {
      filtered = [...filtered].sort((a, b) => a.friendId.localeCompare(b.friendId));
    } else if (sortType === 'friend-weight') {
      filtered = [...filtered].sort(
        (a, b) => get().getFriendWeight(b.id) - get().getFriendWeight(a.id)
      );
    }
    return filtered;
  },

  getExperiencesForCity: (city) => {
    const { experiences, friends } = get();
    const followingIds = new Set(friends.filter((f) => f.isFollowing).map((f) => f.id));
    return experiences
      .filter((e) => e.city.toLowerCase() === city.toLowerCase() && followingIds.has(e.friendId))
      .sort((a, b) => {
        // Friend-weight sort for pre-trip
        const wa = get().getFriendWeight(a.id);
        const wb = get().getFriendWeight(b.id);
        return wb - wa;
      });
  },

  getFriendById: (id) => get().friends.find((f) => f.id === id),
}));
