import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock axios - must define everything inside factory due to hoisting
vi.mock('axios', () => {
  const mockGet = vi.fn();
  const mockAxiosInstance = {
    get: mockGet,
  };
  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
  };
});

// Now import after mocking
import axios from 'axios';
import { PlaylistsService } from '../PlaylistsService';
import type { Playlist } from '../../types';

// Helper to get the mock function
const getMockGet = () => {
  const mockInstance = (axios.create as any)();
  return mockInstance.get;
};

describe('PlaylistsService - Request Deduplication', () => {
  let playlistsService: PlaylistsService;
  const mockPlaylists: Playlist[] = [
    {
      id: 'playlist-1',
      name: 'Test Playlist',
      description: 'Test Description',
      cover: 'https://example.com/cover.jpg',
      userId: 'user-1',
      createdAt: '2024-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    const mockGet = getMockGet();
    mockGet.mockReset();
    playlistsService = new PlaylistsService();
  });

  it('should make only one API call when multiple requests are made for the same userId', async () => {
    const mockGet = getMockGet();
    const userId = '44444444-4444-4444-4444-444444444444';
    
    mockGet.mockResolvedValue({ data: mockPlaylists });

    // Make multiple simultaneous requests
    const promises = Array.from({ length: 50 }, () => playlistsService.getPlaylists(userId));
    const results = await Promise.all(promises);

    // All should return the same data
    results.forEach(result => {
      expect(result).toEqual(mockPlaylists);
    });

    // Should only make ONE API call
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith(`/api/v1/playlists/user/${userId}`);
  });

  it('should deduplicate getPlaylistWithSongs requests', async () => {
    const mockGet = getMockGet();
    const playlistId = 'playlist-123';
    const mockPlaylistWithSongs = {
      id: playlistId,
      name: 'Test Playlist',
      songs: [],
      userId: 'user-1',
      createdAt: '2024-01-01T00:00:00Z',
    };
    
    mockGet.mockResolvedValue({ data: mockPlaylistWithSongs });

    // Make multiple simultaneous requests
    const promises = Array.from({ length: 30 }, () => playlistsService.getPlaylistWithSongs(playlistId));
    const results = await Promise.all(promises);

    // All should return the same data
    results.forEach(result => {
      expect(result).toEqual(mockPlaylistWithSongs);
    });

    // Should only make ONE API call
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith(`/api/v1/playlists/${playlistId}`);
  });
});
