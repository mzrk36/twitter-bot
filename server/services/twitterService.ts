import { TwitterApi } from 'twitter-api-v2';

class TwitterService {
  private client: TwitterApi;

  constructor() {
    const apiKey = process.env.TWITTER_API_KEY;
    const apiSecret = process.env.TWITTER_API_SECRET;
    const accessToken = process.env.TWITTER_ACCESS_TOKEN;
    const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

    if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
      throw new Error('Twitter API credentials are missing');
    }

    this.client = new TwitterApi({
      appKey: apiKey,
      appSecret: apiSecret,
      accessToken: accessToken,
      accessSecret: accessTokenSecret,
    });
  }

  async postTweet(content: string): Promise<string> {
    try {
      const tweet = await this.client.v2.tweet(content);
      return tweet.data.id;
    } catch (error) {
      console.error('Error posting tweet:', error);
      throw new Error('Failed to post tweet to Twitter');
    }
  }

  async getTweetMetrics(tweetId: string) {
    try {
      const tweet = await this.client.v2.singleTweet(tweetId, {
        'tweet.fields': ['public_metrics', 'created_at'],
      });
      
      return {
        likes: tweet.data.public_metrics?.like_count || 0,
        retweets: tweet.data.public_metrics?.retweet_count || 0,
        replies: tweet.data.public_metrics?.reply_count || 0,
        impressions: tweet.data.public_metrics?.impression_count || 0,
      };
    } catch (error) {
      console.error('Error fetching tweet metrics:', error);
      throw new Error('Failed to fetch tweet metrics');
    }
  }

  async getUserMetrics() {
    try {
      const user = await this.client.v2.me({
        'user.fields': ['public_metrics'],
      });
      
      return {
        followers: user.data.public_metrics?.followers_count || 0,
        following: user.data.public_metrics?.following_count || 0,
        tweets: user.data.public_metrics?.tweet_count || 0,
      };
    } catch (error) {
      console.error('Error fetching user metrics:', error);
      throw new Error('Failed to fetch user metrics');
    }
  }

  async verifyCredentials(): Promise<boolean> {
    try {
      await this.client.v2.me();
      return true;
    } catch (error) {
      console.error('Twitter credentials verification failed:', error);
      return false;
    }
  }
}

export const twitterService = new TwitterService();
