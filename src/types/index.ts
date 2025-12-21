export interface Song {
  id: string;
  artist: string;
  audio_url: string;
  cover: string;
  title: string;
  isLiked: boolean;
  isDisliked: boolean;
  likesCount: number;
  dislikesCount: number;
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

export interface SongLikeRequest {
  userId: string;
  songId: string;
}

export interface ChatListItem {
  chatId: string;
  chatType: string;
  title?: string;
  avatarUrl?: string;
  lastMessagePreview?: string;
  lastMessageAt?: string;
  lastMessageSenderId?: string;
  lastMessageSenderName?: string;
  unreadCount: number;
  isMuted: boolean;
  updatedAt?: string;
  participants: ParticipantSummary[];
}

export interface ParticipantSummary {
  userId: string;
  userNickname: string;
  userAvatarUrl?: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId?: string;
  senderEmail?: string;
  senderNickname?: string;
  senderAvatarUrl?: string;
  replyToId?: string;
  messageType: string;
  content?: string;
  songId?: string;
  attachmentCount: number;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Follower {
  followerId: string;
  followerEmail: string;
  followerNickname: string;
  followerAvatarUrl?: string;
  followedAt?: string;
}

