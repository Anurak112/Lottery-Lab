import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, bigint, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Page views tracking for analytics
 */
export const pageViews = mysqlTable("page_views", {
  id: int("id").autoincrement().primaryKey(),
  /** Session ID for anonymous tracking */
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  /** User ID if logged in, null for guests */
  userId: int("userId"),
  /** Page path visited */
  path: varchar("path", { length: 512 }).notNull(),
  /** Referrer URL */
  referrer: varchar("referrer", { length: 512 }),
  /** User agent string */
  userAgent: text("userAgent"),
  /** IP address (hashed for privacy) */
  ipHash: varchar("ipHash", { length: 64 }),
  /** Country from IP geolocation */
  country: varchar("country", { length: 64 }),
  /** Device type: mobile, tablet, desktop */
  deviceType: varchar("deviceType", { length: 32 }),
  /** Browser name */
  browser: varchar("browser", { length: 64 }),
  /** Timestamp of visit */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PageView = typeof pageViews.$inferSelect;
export type InsertPageView = typeof pageViews.$inferInsert;

/**
 * Live chat messages
 */
export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  /** User ID if logged in */
  userId: int("userId"),
  /** Guest name if not logged in */
  guestName: varchar("guestName", { length: 128 }),
  /** Message content */
  message: text("message").notNull(),
  /** Is this from a registered user or guest */
  isGuest: boolean("isGuest").default(true).notNull(),
  /** Timestamp of message */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

/**
 * User sessions for tracking unique visitors
 */
export const sessions = mysqlTable("sessions", {
  id: int("id").autoincrement().primaryKey(),
  /** Unique session identifier */
  sessionId: varchar("sessionId", { length: 64 }).notNull().unique(),
  /** User ID if logged in */
  userId: int("userId"),
  /** First visit timestamp */
  firstVisit: timestamp("firstVisit").defaultNow().notNull(),
  /** Last activity timestamp */
  lastActivity: timestamp("lastActivity").defaultNow().onUpdateNow().notNull(),
  /** Total page views in this session */
  pageViewCount: int("pageViewCount").default(0).notNull(),
  /** Is this a returning visitor */
  isReturning: boolean("isReturning").default(false).notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

/**
 * Daily aggregated stats for dashboard
 */
export const dailyStats = mysqlTable("daily_stats", {
  id: int("id").autoincrement().primaryKey(),
  /** Date of stats (YYYY-MM-DD format stored as varchar) */
  date: varchar("date", { length: 10 }).notNull().unique(),
  /** Total unique visitors */
  uniqueVisitors: int("uniqueVisitors").default(0).notNull(),
  /** Total page views */
  totalPageViews: int("totalPageViews").default(0).notNull(),
  /** New user registrations */
  newUsers: int("newUsers").default(0).notNull(),
  /** Total chat messages */
  chatMessages: int("chatMessages").default(0).notNull(),
  /** Average session duration in seconds */
  avgSessionDuration: int("avgSessionDuration").default(0).notNull(),
});

export type DailyStat = typeof dailyStats.$inferSelect;
export type InsertDailyStat = typeof dailyStats.$inferInsert;
