import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock axios - must define mockGet inside the factory due to hoisting
vi.mock('axios', () => {
  const mockGet = vi.fn();
  const mockAxiosInstance = {
    get: mockGet,
  };
  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
    __mockGet: mockGet, // Export for test access
  };
});

// Now import after mocking
import axios from 'axios';
import { SongsService } from '../SongsService';
import type { Song } from '../../types';

// Get the mock function
const getMockGet = () => {
  const mockInstance = (axios.create as any)();
  return mockInstance.get;
};

describe('SongsService - Request Deduplication (API Flooding Prevention)', () => {
  let songsService: SongsService;
  const problematicUserId = '44444444-4444-4444-4444-444444444444';
  
  const mockSongs: Song[] = [
    {
      id: '1',
      title: 'Test Song',
      artist: 'Test Artist',
      audio_url: 'https://example.com/audio.mp3',
      cover: 'https://example.com/cover.jpg',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    const mockGet = getMockGet();
    mockGet.mockReset();
    songsService = new SongsService();
  });

  it('CRITICAL: should make only ONE API call when 30,000 requests are made for the same userId', async () => {
    const mockGet = getMockGet();
    mockGet.mockResolvedValue({ data: mockSongs });

    // Simulate the exact flooding scenario: 30,000 requests
    const requestCount = 30000;
    const promises = Array.from({ length: requestCount }, () => 
      songsService.getSongs(problematicUserId)
    );

    // Wait for all requests to complete
    const results = await Promise.all(promises);

    // Verify all results are correct
    results.forEach(result => {
      expect(result).toEqual(mockSongs);
    });

    // CRITICAL ASSERTION: Should only make ONE API call, not 30,000
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith(`/api/v1/songs/${problematicUserId}`);
  }, 30000); // 30 second timeout for this critical test

  it('should make only one API call when multiple simultaneous requests are made', async () => {
    const mockGet = getMockGet();
    mockGet.mockResolvedValue({ data: mockSongs });

    // Make 100 simultaneous requests
    const promises = Array.from({ length: 100 }, () => 
      songsService.getSongs(problematicUserId)
    );

    await Promise.all(promises);

    // Should only make ONE API call
    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  it('should make separate API calls for different userIds', async () => {
    const mockGet = getMockGet();
    const userId1 = 'user-1';
    const userId2 = 'user-2';
    
    mockGet
      .mockResolvedValueOnce({ data: mockSongs })
      .mockResolvedValueOnce({ data: mockSongs });

    const promise1 = songsService.getSongs(userId1);
    const promise2 = songsService.getSongs(userId2);

    await Promise.all([promise1, promise2]);

    // Should make TWO separate API calls
    expect(mockGet).toHaveBeenCalledTimes(2);
    expect(mockGet).toHaveBeenCalledWith(`/api/v1/songs/${userId1}`);
    expect(mockGet).toHaveBeenCalledWith(`/api/v1/songs/${userId2}`);
  });

  it('should handle errors and remove from cache', async () => {
    const mockGet = getMockGet();
    const userId = 'error-user';
    const error = new Error('API Error');
    
    mockGet.mockRejectedValueOnce(error);

    // First request should fail
    await expect(songsService.getSongs(userId)).rejects.toThrow('API Error');

    // After error, cache should be cleared, so a new request can be made
    mockGet.mockResolvedValueOnce({ data: mockSongs });
    const result = await songsService.getSongs(userId);

    // Should make TWO calls (one failed, one succeeded)
    expect(mockGet).toHaveBeenCalledTimes(2);
    expect(result).toEqual(mockSongs);
  });

  it('should allow new requests after previous request completes', async () => {
    const mockGet = getMockGet();
    const userId = 'sequential-user';
    
    mockGet
      .mockResolvedValueOnce({ data: mockSongs })
      .mockResolvedValueOnce({ data: [...mockSongs, { id: '2', title: 'New Song', artist: 'New Artist', audio_url: '', cover: '' }] });

    // First request
    const result1 = await songsService.getSongs(userId);
    expect(result1).toEqual(mockSongs);
    expect(mockGet).toHaveBeenCalledTimes(1);

    // Wait a bit to ensure first request is fully cleared
    await new Promise(resolve => setTimeout(resolve, 10));

    // Second request should make a new API call
    const result2 = await songsService.getSongs(userId);
    expect(result2).toHaveLength(2);
    expect(mockGet).toHaveBeenCalledTimes(2);
  });
});
