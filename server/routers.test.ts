import { describe, it, expect, vi, beforeEach } from 'vitest';
import { appRouter } from './routers';
import { createCallerFactory } from './_core/trpc';

// Mock the database functions
vi.mock('./db', () => ({
  trackPageView: vi.fn().mockResolvedValue(undefined),
  getOrCreateSession: vi.fn().mockResolvedValue({ sessionId: 'test-session', pageViewCount: 1 }),
  getDashboardStats: vi.fn().mockResolvedValue({
    totalUsers: 10,
    todayVisitors: 5,
    todayPageViews: 25,
    todayChats: 3,
    newUsersWeek: 2,
  }),
  getRecentUsers: vi.fn().mockResolvedValue([
    { id: 1, name: 'Test User', email: 'test@example.com', role: 'user', createdAt: new Date(), lastSignedIn: new Date() }
  ]),
  getAllUsers: vi.fn().mockResolvedValue([
    { id: 1, name: 'Test User', email: 'test@example.com', role: 'user', createdAt: new Date(), lastSignedIn: new Date() }
  ]),
  getVisitorStats: vi.fn().mockResolvedValue([
    { date: '2024-12-15', visitors: 10, pageViews: 50 },
    { date: '2024-12-16', visitors: 15, pageViews: 75 },
  ]),
  saveChatMessage: vi.fn().mockResolvedValue({
    id: 1,
    message: 'Test message',
    guestName: 'Guest',
    isGuest: true,
    createdAt: new Date(),
  }),
  getRecentChatMessages: vi.fn().mockResolvedValue([
    { id: 1, message: 'Hello', guestName: 'Guest', isGuest: true, createdAt: new Date() }
  ]),
}));

const createCaller = createCallerFactory(appRouter);

describe('Analytics Router', () => {
  it('should track page view successfully', async () => {
    const mockReq = { headers: {} } as any;
    const mockRes = { clearCookie: vi.fn() } as any;
    
    const caller = createCaller({ req: mockReq, res: mockRes, user: null });
    
    const result = await caller.analytics.trackPageView({
      sessionId: 'test-session-123',
      path: '/',
      referrer: 'https://google.com',
      userAgent: 'Mozilla/5.0',
      deviceType: 'desktop',
      browser: 'Chrome',
    });
    
    expect(result).toEqual({ success: true });
  });
});

describe('Chat Router', () => {
  it('should get recent chat messages', async () => {
    const mockReq = { headers: {} } as any;
    const mockRes = { clearCookie: vi.fn() } as any;
    
    const caller = createCaller({ req: mockReq, res: mockRes, user: null });
    
    const messages = await caller.chat.getMessages({ limit: 10 });
    
    expect(Array.isArray(messages)).toBe(true);
    expect(messages.length).toBeGreaterThan(0);
    expect(messages[0]).toHaveProperty('message');
  });

  it('should send a chat message as guest', async () => {
    const mockReq = { headers: {} } as any;
    const mockRes = { clearCookie: vi.fn() } as any;
    
    const caller = createCaller({ req: mockReq, res: mockRes, user: null });
    
    const result = await caller.chat.sendMessage({
      message: 'สวัสดีครับ',
      guestName: 'ผู้เยี่ยมชม',
    });
    
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('message');
    expect(result?.isGuest).toBe(true);
  });
});

describe('Admin Router', () => {
  it('should deny access to non-admin users', async () => {
    const mockReq = { headers: {} } as any;
    const mockRes = { clearCookie: vi.fn() } as any;
    const regularUser = { id: 1, openId: 'user123', role: 'user' as const, name: 'Regular User', email: 'user@test.com', createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(), loginMethod: 'google' };
    
    const caller = createCaller({ req: mockReq, res: mockRes, user: regularUser });
    
    await expect(caller.admin.getDashboardStats()).rejects.toThrow('Admin access required');
  });

  it('should allow admin access to dashboard stats', async () => {
    const mockReq = { headers: {} } as any;
    const mockRes = { clearCookie: vi.fn() } as any;
    const adminUser = { id: 1, openId: 'admin123', role: 'admin' as const, name: 'Admin User', email: 'admin@test.com', createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(), loginMethod: 'google' };
    
    const caller = createCaller({ req: mockReq, res: mockRes, user: adminUser });
    
    const stats = await caller.admin.getDashboardStats();
    
    expect(stats).toHaveProperty('totalUsers');
    expect(stats).toHaveProperty('todayVisitors');
    expect(stats).toHaveProperty('todayPageViews');
    expect(stats?.totalUsers).toBe(10);
  });

  it('should get visitor stats for admin', async () => {
    const mockReq = { headers: {} } as any;
    const mockRes = { clearCookie: vi.fn() } as any;
    const adminUser = { id: 1, openId: 'admin123', role: 'admin' as const, name: 'Admin User', email: 'admin@test.com', createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(), loginMethod: 'google' };
    
    const caller = createCaller({ req: mockReq, res: mockRes, user: adminUser });
    
    const stats = await caller.admin.getVisitorStats({ days: 7 });
    
    expect(Array.isArray(stats)).toBe(true);
    expect(stats.length).toBeGreaterThan(0);
    expect(stats[0]).toHaveProperty('date');
    expect(stats[0]).toHaveProperty('visitors');
  });
});

describe('Auth Router', () => {
  it('should return null for unauthenticated user', async () => {
    const mockReq = { headers: {} } as any;
    const mockRes = { clearCookie: vi.fn() } as any;
    
    const caller = createCaller({ req: mockReq, res: mockRes, user: null });
    
    const result = await caller.auth.me();
    
    expect(result).toBeNull();
  });

  it('should return user data for authenticated user', async () => {
    const mockReq = { headers: {} } as any;
    const mockRes = { clearCookie: vi.fn() } as any;
    const testUser = { id: 1, openId: 'test123', role: 'user' as const, name: 'Test User', email: 'test@test.com', createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(), loginMethod: 'google' };
    
    const caller = createCaller({ req: mockReq, res: mockRes, user: testUser });
    
    const result = await caller.auth.me();
    
    expect(result).toEqual(testUser);
  });
});
