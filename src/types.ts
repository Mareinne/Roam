export type ExperienceType =
  | 'food'
  | 'nature'
  | 'nightlife'
  | 'tip'
  | 'stay'
  | 'culture'
  | 'event'
  | 'everyday';

export type Mood = 'loved it' | 'solid' | 'meh' | 'skip it';

export interface Experience {
  id: string;
  name: string;
  type: ExperienceType;
  location: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  rating: number;
  mood?: Mood;
  review: string;
  photos: string[];
  friendId: string;
  date: string;
  createdAt: string;
  isHometown?: boolean;   // logged in user's home city
  weekend?: boolean;      // weekend activity flag
  echoes?: Echo[];
}

export interface Echo {
  id: string;
  experienceId: string;
  friendId: string;
  rating: number;
  note: string;
  createdAt: string;
}

export interface Trip {
  id: string;
  city: string;
  country: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

export interface DetectedCity {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  arrivedAt: string;
  hasPrompted: boolean;
}

export interface Friend {
  id: string;
  name: string;
  handle: string;
  avatarColor: string;
  avatarInitials: string;
  memoriesCount: number;
  countriesCount: number;
  isFollowing: boolean;
  hometown?: string;
}

export type FilterType = 'all' | ExperienceType | 'hometown' | 'thisweek';
export type SortType = 'rating' | 'recent' | 'friend' | 'friend-weight';
