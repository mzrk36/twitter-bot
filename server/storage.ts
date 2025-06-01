import {
  users,
  tweets,
  botSettings,
  analytics,
  activityLog,
  type User,
  type UpsertUser,
  type Tweet,
  type InsertTweet,
  type BotSettings,
  type InsertBotSettings,
  type Analytics,
  type InsertAnalytics,
  type ActivityLog,
  type InsertActivityLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, gte, and, count } from "drizzle-orm";

export interface IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Tweet operations
  createTweet(tweet: InsertTweet): Promise<Tweet>;
  getTweets(userId: string, limit?: number): Promise<Tweet[]>;
  getScheduledTweets(userId: string): Promise<Tweet[]>;
  updateTweet(id: number, updates: Partial<Tweet>): Promise<Tweet>;
  deleteTweet(id: number): Promise<void>;
  
  // Bot settings operations
  getBotSettings(userId: string): Promise<BotSettings | undefined>;
  upsertBotSettings(settings: InsertBotSettings): Promise<BotSettings>;
  
  // Analytics operations
  getAnalytics(userId: string, startDate?: Date): Promise<Analytics[]>;
  upsertAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  
  // Activity log operations
  logActivity(activity: InsertActivityLog): Promise<ActivityLog>;
  getActivityLog(userId: string, limit?: number): Promise<ActivityLog[]>;
  
  // Dashboard stats
  getDashboardStats(userId: string): Promise<{
    totalTweets: number;
    todayTweets: number;
    scheduledTweets: number;
    engagementRate: number;
    followersGained: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Tweet operations
  async createTweet(tweet: InsertTweet): Promise<Tweet> {
    const [newTweet] = await db.insert(tweets).values(tweet).returning();
    return newTweet;
  }

  async getTweets(userId: string, limit = 50): Promise<Tweet[]> {
    return await db
      .select()
      .from(tweets)
      .where(eq(tweets.userId, userId))
      .orderBy(desc(tweets.createdAt))
      .limit(limit);
  }

  async getScheduledTweets(userId: string): Promise<Tweet[]> {
    const now = new Date();
    return await db
      .select()
      .from(tweets)
      .where(
        and(
          eq(tweets.userId, userId),
          eq(tweets.status, "scheduled"),
          gte(tweets.scheduledFor, now)
        )
      )
      .orderBy(tweets.scheduledFor);
  }

  async updateTweet(id: number, updates: Partial<Tweet>): Promise<Tweet> {
    const [updatedTweet] = await db
      .update(tweets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tweets.id, id))
      .returning();
    return updatedTweet;
  }

  async deleteTweet(id: number): Promise<void> {
    await db.delete(tweets).where(eq(tweets.id, id));
  }

  // Bot settings operations
  async getBotSettings(userId: string): Promise<BotSettings | undefined> {
    const [settings] = await db
      .select()
      .from(botSettings)
      .where(eq(botSettings.userId, userId));
    return settings;
  }

  async upsertBotSettings(settings: InsertBotSettings): Promise<BotSettings> {
    const existing = await this.getBotSettings(settings.userId);
    
    if (existing) {
      const [updated] = await db
        .update(botSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(botSettings.userId, settings.userId))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(botSettings).values(settings).returning();
      return created;
    }
  }

  // Analytics operations
  async getAnalytics(userId: string, startDate?: Date): Promise<Analytics[]> {
    const whereClause = startDate
      ? and(eq(analytics.userId, userId), gte(analytics.date, startDate))
      : eq(analytics.userId, userId);

    return await db
      .select()
      .from(analytics)
      .where(whereClause)
      .orderBy(desc(analytics.date));
  }

  async upsertAnalytics(analyticsData: InsertAnalytics): Promise<Analytics> {
    const [result] = await db
      .insert(analytics)
      .values(analyticsData)
      .onConflictDoUpdate({
        target: [analytics.userId, analytics.date],
        set: analyticsData,
      })
      .returning();
    return result;
  }

  // Activity log operations
  async logActivity(activity: InsertActivityLog): Promise<ActivityLog> {
    const [log] = await db.insert(activityLog).values(activity).returning();
    return log;
  }

  async getActivityLog(userId: string, limit = 20): Promise<ActivityLog[]> {
    return await db
      .select()
      .from(activityLog)
      .where(eq(activityLog.userId, userId))
      .orderBy(desc(activityLog.createdAt))
      .limit(limit);
  }

  // Dashboard stats
  async getDashboardStats(userId: string): Promise<{
    totalTweets: number;
    todayTweets: number;
    scheduledTweets: number;
    engagementRate: number;
    followersGained: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get total tweets
    const [totalResult] = await db
      .select({ count: count() })
      .from(tweets)
      .where(and(eq(tweets.userId, userId), eq(tweets.status, "posted")));

    // Get today's tweets
    const [todayResult] = await db
      .select({ count: count() })
      .from(tweets)
      .where(
        and(
          eq(tweets.userId, userId),
          eq(tweets.status, "posted"),
          gte(tweets.postedAt, today)
        )
      );

    // Get scheduled tweets
    const [scheduledResult] = await db
      .select({ count: count() })
      .from(tweets)
      .where(and(eq(tweets.userId, userId), eq(tweets.status, "scheduled")));

    // Get recent analytics for engagement rate and followers
    const recentAnalytics = await db
      .select()
      .from(analytics)
      .where(eq(analytics.userId, userId))
      .orderBy(desc(analytics.date))
      .limit(1);

    const latestAnalytics = recentAnalytics[0];

    return {
      totalTweets: totalResult.count || 0,
      todayTweets: todayResult.count || 0,
      scheduledTweets: scheduledResult.count || 0,
      engagementRate: latestAnalytics?.engagementRate || 0,
      followersGained: latestAnalytics?.followersGained || 0,
    };
  }
}

export const storage = new DatabaseStorage();
