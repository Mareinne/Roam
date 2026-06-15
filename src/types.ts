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
  photos: string[]; // URIs or asset paths
  friendId: string;
  date: string; // ISO string
  createdAt: string;
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
export type SortType = 'rating' | 'recent' | 'friend';
