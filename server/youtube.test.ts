import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getLiveStreamStatus, searchLotteryStreams } from './youtube';

// Mock the callDataApi function
vi.mock('./_core/dataApi', () => ({
  callDataApi: vi.fn(),
}));

import { callDataApi } from './_core/dataApi';

describe('YouTube API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getLiveStreamStatus', () => {
    it('should return live status when stream is live', async () => {
      const mockResponse = {
        contents: [
          {
            type: 'video',
            video: {
              videoId: 'test123',
              title: 'Live Stream Test',
              isLiveNow: true,
              thumbnails: [{ url: 'https://example.com/thumb.jpg' }],
            },
          },
        ],
      };

      (callDataApi as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponse);

      const result = await getLiveStreamStatus();

      expect(result.isLive).toBe(true);
      expect(result.videoId).toBe('test123');
      expect(result.title).toBe('Live Stream Test');
    });

    it('should return not live when no live stream', async () => {
      const mockLiveResponse = { contents: [] };
      const mockLatestResponse = {
        contents: [
          {
            type: 'video',
            video: {
              videoId: 'latest123',
              title: 'Latest Video',
              isLiveNow: false,
              thumbnails: [{ url: 'https://example.com/thumb.jpg' }],
            },
          },
        ],
      };

      (callDataApi as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(mockLiveResponse)
        .mockResolvedValueOnce(mockLatestResponse);

      const result = await getLiveStreamStatus();

      expect(result.isLive).toBe(false);
      expect(result.videoId).toBe('latest123');
    });

    it('should handle API errors gracefully', async () => {
      (callDataApi as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('API Error'));

      const result = await getLiveStreamStatus();

      expect(result.isLive).toBe(false);
      expect(result.videoId).toBeNull();
    });
  });

  describe('searchLotteryStreams', () => {
    it('should return search results', async () => {
      const mockResponse = {
        contents: [
          {
            type: 'video',
            video: {
              videoId: 'search1',
              title: 'หวย งวดนี้',
              channelTitle: 'Test Channel',
              isLiveNow: false,
              thumbnails: [{ url: 'https://example.com/thumb.jpg' }],
            },
          },
          {
            type: 'video',
            video: {
              videoId: 'search2',
              title: 'ถ่ายทอดสด หวย',
              channelTitle: 'Another Channel',
              isLiveNow: true,
              thumbnails: [{ url: 'https://example.com/thumb2.jpg' }],
            },
          },
        ],
      };

      (callDataApi as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponse);

      const result = await searchLotteryStreams();

      expect(result).toHaveLength(2);
      expect(result[0].videoId).toBe('search1');
      expect(result[1].isLive).toBe(true);
    });

    it('should return empty array on error', async () => {
      (callDataApi as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('API Error'));

      const result = await searchLotteryStreams();

      expect(result).toEqual([]);
    });
  });
});
