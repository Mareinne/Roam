import { create } from 'zustand';
import { Experience, Friend, FilterType, SortType } from '../types';
import { SEED_EXPERIENCES, SEED_FRIENDS } from '../data/seed';

interface RoamStore {
  experiences: Experience[];
  friends: Friend[];
  activeFilter: FilterType;
  activeFriendIds: Set<string>;
  sortType: SortType;
  selectedExperienceId: string | null;

  // Actions
  setFilter: (filter: FilterType) => void;
  toggleFriend: (friendId: string) => void;
  setSort: (sort: SortType) => void;
  selectExperience: (id: string | null) => void;
  addExperience: (exp: Experience) => void;
  toggleFollowFriend: (friendId: string) => void;

  // Selectors (computed)
  getVisibleExperiences: () => Experience[];
  getFriendById: (id: string) => Friend | undefined;
}

export const useRoamStore = create<RoamStore>((set, get) => ({
  experiences: SEED_EXPERIENCES,
  friends: SEED_FRIENDS,
  activeFilter: 'all',
  activeFriendIds: new Set(['all']),
  sortType: 'rating',
  selectedExperienceId: null,

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

  getVisibleExperiences: () => {
    const { experiences, activeFilter, activeFriendIds, sortType } = get();
    let filtered = experiences.filter((e) => {
      const typeMatch = activeFilter === 'all' || e.type === activeFilter;
      const friendMatch =
        activeFriendIds.has('all') || activeFriendIds.has(e.friendId);
      return typeMatch && friendMatch;
    });

    if (sortType === 'rating') {
      filtered = [...filtered].sort((a, b) => b.rating - a.rating);
    } else if (sortType === 'recent') {
      filtered = [...filtered].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortType === 'friend') {
      filtered = [...filtered].sort((a, b) =>
        a.friendId.localeCompare(b.friendId)
      );
    }
    return filtered;
  },

  getFriendById: (id) => get().friends.find((f) => f.id === id),
}));
