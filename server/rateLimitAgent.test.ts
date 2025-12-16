import { describe, it, expect, beforeEach } from 'vitest';
import { 
  checkRateLimit, 
  trackApiUsage, 
  getApiUsageStats, 
  getRateLimitStatus,
  getRateLimitConfigs,
  resetApiStats,
  withRetry
} from './rateLimitAgent';

describe('Rate Limit Agent', () => {
  beforeEach(() => {
    // Reset stats before each test
    resetApiStats();
  });

  describe('checkRateLimit', () => {
    it('should allow requests within limit', () => {
      const result = checkRateLimit('test-user-1', 'public');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThan(0);
    });

    it('should track remaining requests', () => {
      const first = checkRateLimit('test-user-2', 'public');
      const second = checkRateLimit('test-user-2', 'public');
      expect(second.remaining).toBe(first.remaining - 1);
    });

    it('should use different limits for different endpoint types', () => {
      const publicResult = checkRateLimit('test-user-3', 'public');
      const chatResult = checkRateLimit('test-user-3', 'chat');
      
      // Both should be allowed initially
      expect(publicResult.allowed).toBe(true);
      expect(chatResult.allowed).toBe(true);
    });
  });

  describe('trackApiUsage', () => {
    it('should track successful requests', () => {
      trackApiUsage('test.endpoint', true, false, 100);
      const stats = getApiUsageStats();
      
      const testStat = stats.find(s => s.endpoint === 'test.endpoint');
      expect(testStat).toBeDefined();
      expect(testStat?.successCount).toBe(1);
      expect(testStat?.errorCount).toBe(0);
    });

    it('should track failed requests', () => {
      trackApiUsage('test.error', false, false, 50);
      const stats = getApiUsageStats();
      
      const testStat = stats.find(s => s.endpoint === 'test.error');
      expect(testStat).toBeDefined();
      expect(testStat?.errorCount).toBe(1);
    });

    it('should track rate limited requests', () => {
      trackApiUsage('test.limited', false, true, 0);
      const stats = getApiUsageStats();
      
      const testStat = stats.find(s => s.endpoint === 'test.limited');
      expect(testStat).toBeDefined();
      expect(testStat?.rateLimitHits).toBe(1);
    });

    it('should calculate average response time', () => {
      trackApiUsage('test.timing', true, false, 100);
      trackApiUsage('test.timing', true, false, 200);
      const stats = getApiUsageStats();
      
      const testStat = stats.find(s => s.endpoint === 'test.timing');
      expect(testStat?.avgResponseTime).toBe(150);
    });
  });

  describe('getRateLimitStatus', () => {
    it('should return status for all endpoint types', () => {
      const status = getRateLimitStatus('test-user-status');
      
      expect(status).toHaveProperty('public');
      expect(status).toHaveProperty('auth');
      expect(status).toHaveProperty('chat');
      expect(status).toHaveProperty('analytics');
      expect(status).toHaveProperty('youtube');
    });
  });

  describe('getRateLimitConfigs', () => {
    it('should return all rate limit configurations', () => {
      const configs = getRateLimitConfigs();
      
      expect(configs).toHaveProperty('public');
      expect(configs.public).toHaveProperty('windowMs');
      expect(configs.public).toHaveProperty('maxRequests');
    });
  });

  describe('withRetry', () => {
    it('should succeed on first try', async () => {
      const result = await withRetry(async () => 'success');
      expect(result).toBe('success');
    });

    it('should retry on failure and eventually succeed', async () => {
      let attempts = 0;
      const result = await withRetry(async () => {
        attempts++;
        if (attempts < 2) throw new Error('temporary failure');
        return 'success after retry';
      }, { maxRetries: 3, baseDelay: 10 });
      
      expect(result).toBe('success after retry');
      expect(attempts).toBe(2);
    });

    it('should throw after max retries', async () => {
      await expect(
        withRetry(async () => {
          throw new Error('persistent failure');
        }, { maxRetries: 2, baseDelay: 10 })
      ).rejects.toThrow('persistent failure');
    });

    it('should not retry on 401 errors', async () => {
      let attempts = 0;
      await expect(
        withRetry(async () => {
          attempts++;
          throw new Error('401 Unauthorized');
        }, { maxRetries: 3, baseDelay: 10 })
      ).rejects.toThrow('401 Unauthorized');
      
      expect(attempts).toBe(1); // Should not retry
    });
  });
});
