import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tweets = pgTable("tweets", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  tweetId: varchar("tweet_id"),
  scheduledFor: timestamp("scheduled_for"),
  postedAt: timestamp("posted_at"),
  status: varchar("status").notNull().default("draft"), // draft, scheduled, posted, failed
  userId: varchar("user_id").notNull(),
  isAiGenerated: boolean("is_ai_generated").default(false),
  engagementData: jsonb("engagement_data"), // likes, retweets, replies
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const botSettings = pgTable("bot_settings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  isActive: boolean("is_active").default(true),
  autoPosting: boolean("auto_posting").default(true),
  aiGeneration: boolean("ai_generation").default(true),
  dailyTweetLimit: integer("daily_tweet_limit").default(8),
  postingInterval: integer("posting_interval").default(3), // hours
  preferredTopics: jsonb("preferred_topics"), // array of strings
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  date: timestamp("date").notNull(),
  tweetsPosted: integer("tweets_posted").default(0),
  totalLikes: integer("total_likes").default(0),
  totalRetweets: integer("total_retweets").default(0),
  totalReplies: integer("total_replies").default(0),
  followersGained: integer("followers_gained").default(0),
  engagementRate: integer("engagement_rate").default(0), // stored as percentage * 100
  createdAt: timestamp("created_at").defaultNow(),
});

export const activityLog = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  action: varchar("action").notNull(), // tweet_posted, content_generated, bot_paused, etc.
  description: text("description").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertTweetSchema = createInsertSchema(tweets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBotSettingsSchema = createInsertSchema(botSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
  createdAt: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLog).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Tweet = typeof tweets.$inferSelect;
export type InsertTweet = z.infer<typeof insertTweetSchema>;
export type BotSettings = typeof botSettings.$inferSelect;
export type InsertBotSettings = z.infer<typeof insertBotSettingsSchema>;
export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
