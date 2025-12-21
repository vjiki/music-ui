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
 * CRITICAL Integration Test: API Flooding Prevention
 * 
 * This test specifically validates the fix for the scenario where 30,000 requests
 * were being made to: /api/v1/songs/44444444-4444-4444-4444-444444444444
 * 
 * The service layer request deduplication MUST ensure only ONE API call is made.
 */
describe('API Flooding Prevention - Critical Integration Test', () => {
  let songsService: SongsService;
  const problematicUserId = '44444444-4444-4444-4444-444444444444';
  
  const mockSongs = [
    {
      id: '1ad8fef3-a6f6-43f1-84fa-d85e2ce2a19f',
      artist: 'Dead by April',
      audio_url: 'https://drive.google.com/uc?export=download&id=1g-bk1MrEjVlCsCDQBYGp5KvwkJpQ3m-7',
      cover: 'https://drive.google.com/uc?export=download&id=1rzDJQjRxZ1wMDUUK6LRVEiq0lB17HmKh',
      title: 'Lost',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    const mockGet = getMockGet();
    mockGet.mockReset();
    songsService = new SongsService();
  });

  it('CRITICAL: should prevent flooding when 30,000 requests are made for the same userId', async () => {
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
  }, 30000); // 30 second timeout

  it('should handle rapid-fire requests without flooding', async () => {
    const mockGet = getMockGet();
    mockGet.mockResolvedValue({ data: mockSongs });

    // Make requests as fast as possible
    const promises: Promise<any>[] = [];
    for (let i = 0; i < 1000; i++) {
      promises.push(songsService.getSongs(problematicUserId));
    }

    await Promise.all(promises);

    // Should still only make ONE call
    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  it('should handle concurrent requests from different sources', async () => {
    const mockGet = getMockGet();
    mockGet.mockResolvedValue({ data: mockSongs });

    // Simulate multiple components/contexts making requests simultaneously
    const batch1 = Array.from({ length: 100 }, () => songsService.getSongs(problematicUserId));
    const batch2 = Array.from({ length: 100 }, () => songsService.getSongs(problematicUserId));
    const batch3 = Array.from({ length: 100 }, () => songsService.getSongs(problematicUserId));

    await Promise.all([...batch1, ...batch2, ...batch3]);

    // Should only make ONE API call
    expect(mockGet).toHaveBeenCalledTimes(1);
  });
});
