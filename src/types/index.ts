export interface Song {
  id: string;
  artist: string;
  audio_url: string;
  cover: string;
  title: string;
}

export interface User {
  id: string;
  email: string;
  nickname?: string;
  avatarUrl?: string;
  accessLevel?: string;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  authenticated: boolean;
  userId: string;
  message: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  cover?: string;
  userId: string;
  createdAt: string;
}

export interface PlaylistWithSongs extends Playlist {
  songs: Song[];
}

export interface Story {
  id: string;
  userId: string;
  songId: string;
  song: Song;
  userName: string;
  profileImageURL?: string;
  storyImageURL?: string;
  storyPreviewURL?: string;
  isViewed: boolean;
  createdAt: string;
}

export interface SongLikeResponse {
  isLiked: boolean;
  isDisliked: boolean;
}

export interface SongLikeRequest {
  userId: string;
  songId: string;
}

