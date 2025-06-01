import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { twitterService } from "./services/twitterService";
import { openaiService } from "./services/openaiService";
import { cronService } from "./services/cronService";
import { insertTweetSchema, insertBotSettingsSchema, insertActivityLogSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Bot settings routes
  app.get('/api/bot/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let settings = await storage.getBotSettings(userId);
      
      if (!settings) {
        // Create default settings
        settings = await storage.upsertBotSettings({
          userId,
          isActive: true,
          autoPosting: true,
          aiGeneration: true,
          dailyTweetLimit: 8,
          postingInterval: 3,
          preferredTopics: ["motivation", "success", "inspiration", "productivity"]
        });
      }
      
      res.json(settings);
    } catch (error) {
      console.error("Error fetching bot settings:", error);
      res.status(500).json({ message: "Failed to fetch bot settings" });
    }
  });

  app.put('/api/bot/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertBotSettingsSchema.parse({ ...req.body, userId });
      
      const settings = await storage.upsertBotSettings(validatedData);
      
      // Log activity
      await storage.logActivity({
        userId,
        action: "settings_updated",
        description: "Bot settings were updated",
        metadata: { changes: req.body }
      });
      
      res.json(settings);
    } catch (error) {
      console.error("Error updating bot settings:", error);
      res.status(500).json({ message: "Failed to update bot settings" });
    }
  });

  // Tweet routes
  app.get('/api/tweets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      const tweets = await storage.getTweets(userId, limit);
      res.json(tweets);
    } catch (error) {
      console.error("Error fetching tweets:", error);
      res.status(500).json({ message: "Failed to fetch tweets" });
    }
  });

  app.get('/api/tweets/scheduled', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tweets = await storage.getScheduledTweets(userId);
      res.json(tweets);
    } catch (error) {
      console.error("Error fetching scheduled tweets:", error);
      res.status(500).json({ message: "Failed to fetch scheduled tweets" });
    }
  });

  app.post('/api/tweets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertTweetSchema.parse({ ...req.body, userId });
      
      const tweet = await storage.createTweet(validatedData);
      
      // If posting immediately
      if (req.body.postNow) {
        try {
          const tweetId = await twitterService.postTweet(tweet.content);
          await storage.updateTweet(tweet.id, {
            tweetId,
            status: "posted",
            postedAt: new Date()
          });
          
          await storage.logActivity({
            userId,
            action: "tweet_posted",
            description: `Tweet posted: "${tweet.content.substring(0, 50)}${tweet.content.length > 50 ? '...' : ''}"`,
            metadata: { tweetId, content: tweet.content }
          });
        } catch (postError) {
          await storage.updateTweet(tweet.id, { status: "failed" });
          throw postError;
        }
      }
      
      res.json(tweet);
    } catch (error) {
      console.error("Error creating tweet:", error);
      res.status(500).json({ message: "Failed to create tweet" });
    }
  });

  app.delete('/api/tweets/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tweetId = parseInt(req.params.id);
      
      // Verify ownership
      const tweets = await storage.getTweets(userId);
      const tweet = tweets.find(t => t.id === tweetId);
      
      if (!tweet) {
        return res.status(404).json({ message: "Tweet not found" });
      }
      
      await storage.deleteTweet(tweetId);
      
      await storage.logActivity({
        userId,
        action: "tweet_deleted",
        description: `Tweet deleted: "${tweet.content.substring(0, 50)}${tweet.content.length > 50 ? '...' : ''}"`,
        metadata: { tweetId: tweet.id }
      });
      
      res.json({ message: "Tweet deleted successfully" });
    } catch (error) {
      console.error("Error deleting tweet:", error);
      res.status(500).json({ message: "Failed to delete tweet" });
    }
  });

  // Content generation
  app.post('/api/content/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { topic, count = 1 } = req.body;
      
      const settings = await storage.getBotSettings(userId);
      const topics = settings?.preferredTopics || ["motivation"];
      const selectedTopic = topic || topics[Math.floor(Math.random() * topics.length)];
      
      const generatedContent = await openaiService.generateMotivationalTweets(selectedTopic, count);
      
      // Save generated tweets as drafts
      const tweets = [];
      for (const content of generatedContent) {
        const tweet = await storage.createTweet({
          userId,
          content,
          status: "draft",
          isAiGenerated: true
        });
        tweets.push(tweet);
      }
      
      await storage.logActivity({
        userId,
        action: "content_generated",
        description: `Generated ${count} tweet(s) with AI`,
        metadata: { topic: selectedTopic, count }
      });
      
      res.json(tweets);
    } catch (error) {
      console.error("Error generating content:", error);
      res.status(500).json({ message: "Failed to generate content" });
    }
  });

  // Bot control
  app.post('/api/bot/pause', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      await storage.upsertBotSettings({
        userId,
        isActive: false
      });
      
      await storage.logActivity({
        userId,
        action: "bot_paused",
        description: "Bot was paused by user",
        metadata: {}
      });
      
      res.json({ message: "Bot paused successfully" });
    } catch (error) {
      console.error("Error pausing bot:", error);
      res.status(500).json({ message: "Failed to pause bot" });
    }
  });

  app.post('/api/bot/resume', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      await storage.upsertBotSettings({
        userId,
        isActive: true
      });
      
      await storage.logActivity({
        userId,
        action: "bot_resumed",
        description: "Bot was resumed by user",
        metadata: {}
      });
      
      res.json({ message: "Bot resumed successfully" });
    } catch (error) {
      console.error("Error resuming bot:", error);
      res.status(500).json({ message: "Failed to resume bot" });
    }
  });

  // Analytics
  app.get('/api/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const days = parseInt(req.query.days as string) || 7;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const analytics = await storage.getAnalytics(userId, startDate);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Activity log
  app.get('/api/activity', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 20;
      const activities = await storage.getActivityLog(userId, limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activity log:", error);
      res.status(500).json({ message: "Failed to fetch activity log" });
    }
  });

  // Initialize cron service
  cronService.start();

  const httpServer = createServer(app);
  return httpServer;
}
