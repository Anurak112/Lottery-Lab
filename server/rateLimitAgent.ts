/**
 * Rate Limit Agent
 * Manages API rate limits, request tracking, and error handling
 */

interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
  message?: string;      // Custom error message
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

interface ApiUsageStats {
  endpoint: string;
  totalRequests: number;
  successCount: number;
  errorCount: number;
  rateLimitHits: number;
  avgResponseTime: number;
  lastRequest: Date;
}

// In-memory storage for rate limiting (use Redis in production)
const requestStore = new Map<string, RequestRecord>();
const apiUsageStats = new Map<string, ApiUsageStats>();

// Default rate limit configurations per endpoint type
const defaultLimits: Record<string, RateLimitConfig> = {
  'public': { windowMs: 60000, maxRequests: 100, message: 'Too many requests, please try again later' },
  'auth': { windowMs: 60000, maxRequests: 30, message: 'Too many authentication attempts' },
  'chat': { windowMs: 60000, maxRequests: 60, message: 'Chat rate limit exceeded' },
  'analytics': { windowMs: 60000, maxRequests: 20, message: 'Analytics rate limit exceeded' },
  'youtube': { windowMs: 60000, maxRequests: 10, message: 'YouTube API rate limit exceeded' },
};

/**
 * Check if a request should be rate limited
 */
export function checkRateLimit(
  identifier: string, 
  endpointType: string = 'public'
): { allowed: boolean; remaining: number; resetIn: number; message?: string } {
  const config = defaultLimits[endpointType] || defaultLimits['public'];
  const now = Date.now();
  const key = `${identifier}:${endpointType}`;
  
  let record = requestStore.get(key);
  
  // Reset if window has passed
  if (!record || now > record.resetTime) {
    record = {
      count: 0,
      resetTime: now + config.windowMs,
    };
  }
  
  record.count++;
  requestStore.set(key, record);
  
  const remaining = Math.max(0, config.maxRequests - record.count);
  const resetIn = Math.max(0, record.resetTime - now);
  
  if (record.count > config.maxRequests) {
    // Track rate limit hit
    trackApiUsage(endpointType, false, true);
    
    return {
      allowed: false,
      remaining: 0,
      resetIn,
      message: config.message,
    };
  }
  
  return {
    allowed: true,
    remaining,
    resetIn,
  };
}

/**
 * Track API usage statistics
 */
export function trackApiUsage(
  endpoint: string, 
  success: boolean = true, 
  rateLimited: boolean = false,
  responseTime: number = 0
): void {
  let stats = apiUsageStats.get(endpoint);
  
  if (!stats) {
    stats = {
      endpoint,
      totalRequests: 0,
      successCount: 0,
      errorCount: 0,
      rateLimitHits: 0,
      avgResponseTime: 0,
      lastRequest: new Date(),
    };
  }
  
  stats.totalRequests++;
  stats.lastRequest = new Date();
  
  if (rateLimited) {
    stats.rateLimitHits++;
  } else if (success) {
    stats.successCount++;
  } else {
    stats.errorCount++;
  }
  
  // Update average response time
  if (responseTime > 0) {
    stats.avgResponseTime = (stats.avgResponseTime * (stats.totalRequests - 1) + responseTime) / stats.totalRequests;
  }
  
  apiUsageStats.set(endpoint, stats);
}

/**
 * Get all API usage statistics
 */
export function getApiUsageStats(): ApiUsageStats[] {
  return Array.from(apiUsageStats.values());
}

/**
 * Get rate limit status for all endpoint types
 */
export function getRateLimitStatus(identifier: string): Record<string, { remaining: number; resetIn: number }> {
  const status: Record<string, { remaining: number; resetIn: number }> = {};
  
  for (const endpointType of Object.keys(defaultLimits)) {
    const result = checkRateLimit(identifier, endpointType);
    status[endpointType] = {
      remaining: result.remaining,
      resetIn: result.resetIn,
    };
    // Decrement count since this was just a status check
    const key = `${identifier}:${endpointType}`;
    const record = requestStore.get(key);
    if (record) {
      record.count = Math.max(0, record.count - 1);
    }
  }
  
  return status;
}

/**
 * Error handler with retry logic
 */
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const { maxRetries, baseDelay, maxDelay, backoffMultiplier } = {
    ...defaultRetryConfig,
    ...config,
  };
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on certain errors
      if (isNonRetryableError(error)) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        const delay = Math.min(baseDelay * Math.pow(backoffMultiplier, attempt), maxDelay);
        await sleep(delay);
      }
    }
  }
  
  throw lastError;
}

function isNonRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    // Don't retry authentication errors
    if (error.message.includes('401') || error.message.includes('403')) {
      return true;
    }
    // Don't retry validation errors
    if (error.message.includes('400') || error.message.includes('validation')) {
      return true;
    }
  }
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Clean up old rate limit records (call periodically)
 */
export function cleanupRateLimitRecords(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  requestStore.forEach((record, key) => {
    if (now > record.resetTime) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => requestStore.delete(key));
}

// Auto-cleanup every 5 minutes
setInterval(cleanupRateLimitRecords, 5 * 60 * 1000);

/**
 * Reset statistics (for testing or admin purposes)
 */
export function resetApiStats(): void {
  apiUsageStats.clear();
}

/**
 * Get summary of rate limit configurations
 */
export function getRateLimitConfigs(): Record<string, RateLimitConfig> {
  return { ...defaultLimits };
}
