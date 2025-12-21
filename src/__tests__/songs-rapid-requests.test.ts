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
import { SongsService } from '../services/SongsService';

// Helper to get the mock function
const getMockGet = () => {
  const mockInstance = (axios.create as any)();
  return mockInstance.get;
};

/**
 * Test for rapid requests scenario - simulates component re-rendering rapidly
 */
describe('SongsService - Rapid Requests Prevention', () => {
  let songsService: SongsService;
  const userId = '44444444-4444-4444-4444-444444444444';
  
  const mockSongs = [
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

  it('should prevent flooding when requests are made rapidly after promise resolves', async () => {
    const mockGet = getMockGet();
    mockGet.mockResolvedValue({ data: mockSongs });

    // First request
    const result1 = await songsService.getSongs(userId);
    expect(result1).toEqual(mockSongs);
    expect(mockGet).toHaveBeenCalledTimes(1);

    // Rapidly make many more requests (simulating component re-renders)
    const promises = Array.from({ length: 1000 }, () => songsService.getSongs(userId));
    const results = await Promise.all(promises);

    // All should return the same data
    results.forEach(result => {
      expect(result).toEqual(mockSongs);
    });

    // Should still only make ONE API call (result cache prevents new requests)
    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  it('should handle rapid requests during pending request', async () => {
    const mockGet = getMockGet();
    // Delay the response to simulate slow network
    let callCount = 0;
    mockGet.mockImplementation(() => {
      callCount++;
      return new Promise(resolve => setTimeout(() => resolve({ data: mockSongs }), 50));
    });

    // Make many requests while first is still pending
    const promises = Array.from({ length: 500 }, () => songsService.getSongs(userId));
    
    const results = await Promise.all(promises);

    // All should return the same data
    results.forEach(result => {
      expect(result).toEqual(mockSongs);
    });

    // Should only make ONE API call (pending cache prevents duplicates)
    // Note: We check callCount instead of mockGet.mock.calls.length because the mock might be reset
    expect(callCount).toBe(1);
  }, 10000);
});

