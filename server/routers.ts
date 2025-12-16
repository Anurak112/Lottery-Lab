import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { 
  trackPageView, 
  getOrCreateSession, 
  getDashboardStats, 
  getRecentUsers,
  getAllUsers,
  getVisitorStats,
  saveChatMessage,
  getRecentChatMessages
} from "./db";
import { TRPCError } from "@trpc/server";
import { getLiveStreamStatus, searchLotteryStreams } from "./youtube";
import { 
  checkRateLimit, 
  getApiUsageStats, 
  getRateLimitStatus,
  getRateLimitConfigs,
  trackApiUsage
} from "./rateLimitAgent";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

// Rate limited procedure wrapper
const rateLimitedProcedure = (endpointType: string) => publicProcedure.use(({ ctx, next }) => {
  const identifier = ctx.req.ip || ctx.req.headers['x-forwarded-for'] as string || 'anonymous';
  const result = checkRateLimit(identifier, endpointType);
  
  if (!result.allowed) {
    throw new TRPCError({ 
      code: 'TOO_MANY_REQUESTS', 
      message: result.message || 'Rate limit exceeded'
    });
  }
  
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Analytics tracking
  analytics: router({
    trackPageView: rateLimitedProcedure('analytics')
      .input(z.object({
        sessionId: z.string(),
        path: z.string(),
        referrer: z.string().optional(),
        userAgent: z.string().optional(),
        deviceType: z.string().optional(),
        browser: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const startTime = Date.now();
        try {
          await trackPageView({
            sessionId: input.sessionId,
            userId: ctx.user?.id,
            path: input.path,
            referrer: input.referrer,
            userAgent: input.userAgent,
            deviceType: input.deviceType,
            browser: input.browser,
          });
          
          await getOrCreateSession(input.sessionId, ctx.user?.id);
          
          trackApiUsage('analytics.trackPageView', true, false, Date.now() - startTime);
          return { success: true };
        } catch (error) {
          trackApiUsage('analytics.trackPageView', false, false, Date.now() - startTime);
          throw error;
        }
      }),
  }),

  // Admin dashboard
  admin: router({
    getDashboardStats: adminProcedure.query(async () => {
      const startTime = Date.now();
      try {
        const result = await getDashboardStats();
        trackApiUsage('admin.getDashboardStats', true, false, Date.now() - startTime);
        return result;
      } catch (error) {
        trackApiUsage('admin.getDashboardStats', false, false, Date.now() - startTime);
        throw error;
      }
    }),
    
    getRecentUsers: adminProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return getRecentUsers(input?.limit || 10);
      }),
    
    getAllUsers: adminProcedure.query(async () => {
      return getAllUsers();
    }),
    
    getVisitorStats: adminProcedure
      .input(z.object({ days: z.number().optional() }).optional())
      .query(async ({ input }) => {
        const startTime = Date.now();
        try {
          const result = await getVisitorStats(input?.days || 7);
          trackApiUsage('admin.getVisitorStats', true, false, Date.now() - startTime);
          return result;
        } catch (error) {
          trackApiUsage('admin.getVisitorStats', false, false, Date.now() - startTime);
          // Return empty array instead of throwing to prevent dashboard crash
          console.error('[Admin] getVisitorStats error:', error);
          return [];
        }
      }),
    
    // Rate limit monitoring
    getApiUsageStats: adminProcedure.query(() => {
      return getApiUsageStats();
    }),
    
    getRateLimitConfigs: adminProcedure.query(() => {
      return getRateLimitConfigs();
    }),
  }),

  // Live chat
  chat: router({
    getMessages: rateLimitedProcedure('chat')
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return getRecentChatMessages(input?.limit || 50);
      }),
    
    sendMessage: rateLimitedProcedure('chat')
      .input(z.object({
        message: z.string().min(1).max(500),
        guestName: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const startTime = Date.now();
        const isGuest = !ctx.user;
        
        try {
          const message = await saveChatMessage({
            userId: ctx.user?.id,
            guestName: isGuest ? (input.guestName || 'Guest') : null,
            message: input.message,
            isGuest,
          });
          
          trackApiUsage('chat.sendMessage', true, false, Date.now() - startTime);
          return message;
        } catch (error) {
          trackApiUsage('chat.sendMessage', false, false, Date.now() - startTime);
          throw error;
        }
      }),
  }),

  // YouTube Live Stream
  youtube: router({
    getLiveStatus: rateLimitedProcedure('youtube').query(async () => {
      const startTime = Date.now();
      try {
        const result = await getLiveStreamStatus();
        trackApiUsage('youtube.getLiveStatus', true, false, Date.now() - startTime);
        return result;
      } catch (error) {
        trackApiUsage('youtube.getLiveStatus', false, false, Date.now() - startTime);
        throw error;
      }
    }),
    
    searchStreams: rateLimitedProcedure('youtube').query(async () => {
      const startTime = Date.now();
      try {
        const result = await searchLotteryStreams();
        trackApiUsage('youtube.searchStreams', true, false, Date.now() - startTime);
        return result;
      } catch (error) {
        trackApiUsage('youtube.searchStreams', false, false, Date.now() - startTime);
        throw error;
      }
    }),
  }),

  // Rate limit status (public - for client-side awareness)
  rateLimit: router({
    getStatus: publicProcedure.query(({ ctx }) => {
      const identifier = ctx.req.ip || ctx.req.headers['x-forwarded-for'] as string || 'anonymous';
      return getRateLimitStatus(identifier);
    }),
  }),
});

export type AppRouter = typeof appRouter;
