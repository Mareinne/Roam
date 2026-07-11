export type ExperienceType = 'food' | 'nature' | 'nightlife' | 'tip' | 'stay' | 'culture';

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
  review: string;
  photos: string[];
  friendId: string;
  date: string;
  createdAt: string;
  // Echo data
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
}

export type FilterType = 'all' | ExperienceType;
export type SortType = 'rating' | 'recent' | 'friend' | 'friend-weight';
