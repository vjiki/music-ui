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
import { PlaylistsService } from '../services/PlaylistsService';

// Helper to get the mock function
const getMockGet = () => {
  const mockInstance = (axios.create as any)();
  return mockInstance.get;
};

/**
 * CRITICAL Test: Playlists API Flooding Prevention
 * 
 * This test validates the fix for playlists flooding after login
 */
describe('Playlists API Flooding Prevention - Critical Test', () => {
  let playlistsService: PlaylistsService;
  const problematicUserId = '44444444-4444-4444-4444-444444444444';
  
  const mockPlaylists = [
    {
      id: 'playlist-1',
      name: 'Test Playlist',
      description: 'Test Description',
      cover: 'https://example.com/cover.jpg',
      userId: problematicUserId,
      createdAt: '2024-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    const mockGet = getMockGet();
    mockGet.mockReset();
    playlistsService = new PlaylistsService();
  });

  it('CRITICAL: should prevent flooding when millions of requests are made for playlists after login', async () => {
    const mockGet = getMockGet();
    mockGet.mockResolvedValue({ data: mockPlaylists });

    // Simulate the flooding scenario: 1,000,000 requests (simulating millions)
    const requestCount = 1000000;
    const promises = Array.from({ length: requestCount }, () => 
      playlistsService.getPlaylists(problematicUserId)
    );

    // Wait for all requests to complete
    const results = await Promise.all(promises);

    // Verify all results are correct
    results.forEach(result => {
      expect(result).toEqual(mockPlaylists);
    });

    // CRITICAL ASSERTION: Should only make ONE API call, not millions
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith(`/api/v1/playlists/user/${problematicUserId}`);
  }, 60000); // 60 second timeout for this critical test

  it('should handle rapid sequential requests after login', async () => {
    const mockGet = getMockGet();
    mockGet.mockResolvedValue({ data: mockPlaylists });

    // Simulate rapid requests that might happen after login
    const promises: Promise<any>[] = [];
    for (let i = 0; i < 10000; i++) {
      promises.push(playlistsService.getPlaylists(problematicUserId));
    }

    await Promise.all(promises);

    // Should still only make ONE call
    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  it('should handle concurrent requests from multiple components', async () => {
    const mockGet = getMockGet();
    mockGet.mockResolvedValue({ data: mockPlaylists });

    // Simulate multiple components making requests simultaneously after login
    const batch1 = Array.from({ length: 1000 }, () => playlistsService.getPlaylists(problematicUserId));
    const batch2 = Array.from({ length: 1000 }, () => playlistsService.getPlaylists(problematicUserId));
    const batch3 = Array.from({ length: 1000 }, () => playlistsService.getPlaylists(problematicUserId));
    const batch4 = Array.from({ length: 1000 }, () => playlistsService.getPlaylists(problematicUserId));
    const batch5 = Array.from({ length: 1000 }, () => playlistsService.getPlaylists(problematicUserId));

    await Promise.all([...batch1, ...batch2, ...batch3, ...batch4, ...batch5]);

    // Should only make ONE API call
    expect(mockGet).toHaveBeenCalledTimes(1);
  });
});

