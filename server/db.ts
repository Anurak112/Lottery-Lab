import { eq, desc, sql, and, gte, lte, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  pageViews, InsertPageView,
  chatMessages, InsertChatMessage,
  sessions, InsertSession,
  dailyStats, InsertDailyStat
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ Analytics Queries ============

export async function trackPageView(data: InsertPageView) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(pageViews).values(data);
}

export async function getOrCreateSession(sessionId: string, userId?: number) {
  const db = await getDb();
  if (!db) return null;
  
  const existing = await db.select().from(sessions).where(eq(sessions.sessionId, sessionId)).limit(1);
  
  if (existing.length > 0) {
    // Update last activity
    await db.update(sessions)
      .set({ lastActivity: new Date(), pageViewCount: sql`${sessions.pageViewCount} + 1` })
      .where(eq(sessions.sessionId, sessionId));
    return existing[0];
  }
  
  // Create new session
  await db.insert(sessions).values({
    sessionId,
    userId,
    pageViewCount: 1,
  });
  
  const newSession = await db.select().from(sessions).where(eq(sessions.sessionId, sessionId)).limit(1);
  return newSession[0] || null;
}

export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return null;
  
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  // Total users
  const totalUsersResult = await db.select({ count: count() }).from(users);
  const totalUsers = totalUsersResult[0]?.count || 0;
  
  // Today's visitors (unique sessions)
  const todayVisitorsResult = await db.select({ count: sql<number>`COUNT(DISTINCT ${sessions.sessionId})` })
    .from(sessions)
    .where(sql`DATE(${sessions.firstVisit}) = ${todayStr}`);
  const todayVisitors = todayVisitorsResult[0]?.count || 0;
  
  // Total page views today
  const todayPageViewsResult = await db.select({ count: count() })
    .from(pageViews)
    .where(sql`DATE(${pageViews.createdAt}) = ${todayStr}`);
  const todayPageViews = todayPageViewsResult[0]?.count || 0;
  
  // Chat messages today
  const todayChatResult = await db.select({ count: count() })
    .from(chatMessages)
    .where(sql`DATE(${chatMessages.createdAt}) = ${todayStr}`);
  const todayChats = todayChatResult[0]?.count || 0;
  
  // New users this week
  const newUsersWeekResult = await db.select({ count: count() })
    .from(users)
    .where(gte(users.createdAt, last7Days));
  const newUsersWeek = newUsersWeekResult[0]?.count || 0;
  
  return {
    totalUsers,
    todayVisitors,
    todayPageViews,
    todayChats,
    newUsersWeek,
  };
}

export async function getRecentUsers(limit = 10) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(users).orderBy(desc(users.createdAt)).limit(limit);
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function getVisitorStats(days = 7) {
  const db = await getDb();
  if (!db) return [];
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];
  
  // Get daily visitor counts using raw SQL with proper GROUP BY
  try {
    // Use raw SQL query to avoid GROUP BY issues with sql_mode=only_full_group_by
    const result = await db.execute(
      sql`SELECT 
            DATE(firstVisit) as date,
            COUNT(DISTINCT sessionId) as visitors,
            COALESCE(SUM(pageViewCount), 0) as pageViews
          FROM sessions
          WHERE DATE(firstVisit) >= ${startDateStr}
          GROUP BY DATE(firstVisit)
          ORDER BY DATE(firstVisit)`
    );
    
    // Format the result
    const rows = (result as any)[0] || [];
    return rows.map((row: any) => ({
      date: row.date,
      visitors: Number(row.visitors) || 0,
      pageViews: Number(row.pageViews) || 0,
    }));
  } catch (error) {
    console.error('[Database] getVisitorStats error:', error);
    return [];
  }
}

// ============ Chat Queries ============

export async function saveChatMessage(data: InsertChatMessage) {
  const db = await getDb();
  if (!db) return null;
  
  await db.insert(chatMessages).values(data);
  
  // Return the inserted message
  const result = await db.select().from(chatMessages).orderBy(desc(chatMessages.id)).limit(1);
  return result[0] || null;
}

export async function getRecentChatMessages(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  const messages = await db.select().from(chatMessages).orderBy(desc(chatMessages.createdAt)).limit(limit);
  return messages.reverse(); // Return in chronological order
}
