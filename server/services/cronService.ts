import * as cron from 'node-cron';
import { storage } from '../storage';
import { twitterService } from './twitterService';
import { openaiService } from './openaiService';

class CronService {
  private isRunning = false;

  start() {
    if (this.isRunning) return;
    
    console.log('Starting cron service...');
    
    // Check for scheduled tweets every minute
    cron.schedule('* * * * *', this.processScheduledTweets.bind(this));
    
    // Generate analytics data daily at midnight
    cron.schedule('0 0 * * *', this.updateDailyAnalytics.bind(this));
    
    // Auto-generate content for active bots every 4 hours
    cron.schedule('0 */4 * * *', this.autoGenerateContent.bind(this));
    
    this.isRunning = true;
    console.log('Cron service started successfully');
  }

  stop() {
    // Note: node-cron doesn't have a built-in way to stop all tasks
    // In a production environment, you might want to track task references
    this.isRunning = false;
    console.log('Cron service stopped');
  }

  private async processScheduledTweets() {
    try {
      // This is a simplified approach - in production, you'd want to process by user
      // For now, we'll assume we need to get all users and check their scheduled tweets
      console.log('Checking for scheduled tweets...');
      
      // This would need to be implemented to get all users with scheduled tweets
      // For brevity, this is a placeholder implementation
    } catch (error) {
      console.error('Error processing scheduled tweets:', error);
    }
  }

  private async updateDailyAnalytics() {
    try {
      console.log('Updating daily analytics...');
      
      // This would fetch data for all users and update their analytics
      // For brevity, this is a placeholder implementation
    } catch (error) {
      console.error('Error updating daily analytics:', error);
    }
  }

  private async autoGenerateContent() {
    try {
      console.log('Auto-generating content for active bots...');
      
      // This would generate content for users with auto-generation enabled
      // For brevity, this is a placeholder implementation
    } catch (error) {
      console.error('Error auto-generating content:', error);
    }
  }

  async processUserScheduledTweets(userId: string) {
    try {
      const settings = await storage.getBotSettings(userId);
      
      if (!settings?.isActive || !settings?.autoPosting) {
        return;
      }

      const now = new Date();
      const scheduledTweets = await storage.getScheduledTweets(userId);
      
      for (const tweet of scheduledTweets) {
        if (tweet.scheduledFor && tweet.scheduledFor <= now) {
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
              description: `Scheduled tweet posted: "${tweet.content.substring(0, 50)}${tweet.content.length > 50 ? '...' : ''}"`,
              metadata: { tweetId, scheduled: true }
            });
            
            console.log(`Posted scheduled tweet for user ${userId}: ${tweet.id}`);
          } catch (error) {
            console.error(`Failed to post scheduled tweet ${tweet.id}:`, error);
            
            await storage.updateTweet(tweet.id, {
              status: "failed"
            });
            
            await storage.logActivity({
              userId,
              action: "tweet_failed",
              description: `Failed to post scheduled tweet: "${tweet.content.substring(0, 50)}${tweet.content.length > 50 ? '...' : ''}"`,
              metadata: { error: error.message }
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error processing scheduled tweets for user ${userId}:`, error);
    }
  }

  async generateContentForUser(userId: string) {
    try {
      const settings = await storage.getBotSettings(userId);
      
      if (!settings?.isActive || !settings?.aiGeneration) {
        return;
      }

      const topics = settings.preferredTopics || ["motivation"];
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      
      const content = await openaiService.generateMotivationalTweets(randomTopic, 1);
      
      if (content.length > 0) {
        // Schedule the tweet for the next posting interval
        const scheduledFor = new Date();
        scheduledFor.setHours(scheduledFor.getHours() + (settings.postingInterval || 3));
        
        await storage.createTweet({
          userId,
          content: content[0],
          status: "scheduled",
          scheduledFor,
          isAiGenerated: true
        });
        
        await storage.logActivity({
          userId,
          action: "content_generated",
          description: `Auto-generated content scheduled for ${scheduledFor.toLocaleString()}`,
          metadata: { topic: randomTopic, scheduledFor }
        });
      }
    } catch (error) {
      console.error(`Error generating content for user ${userId}:`, error);
    }
  }
}

export const cronService = new CronService();
