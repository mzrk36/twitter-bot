import OpenAI from "openai";

class OpenAIService {
  private client: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key is missing');
    }

    this.client = new OpenAI({ apiKey });
  }

  async generateMotivationalTweets(topic: string, count: number = 1): Promise<string[]> {
    try {
      const prompt = `Generate ${count} motivational tweets about ${topic}. Each tweet should be:
      - Inspiring and positive
      - 280 characters or less
      - Include relevant hashtags
      - Be engaging and shareable
      - Avoid being preachy or overly generic
      
      Return the tweets as a JSON array of strings.`;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await this.client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert at creating engaging, motivational content for social media. Generate authentic, inspiring tweets that resonate with people."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
        max_tokens: 1000
      });

      const result = JSON.parse(response.choices[0].message.content || '{"tweets": []}');
      return result.tweets || [];
    } catch (error) {
      console.error('Error generating motivational tweets:', error);
      throw new Error('Failed to generate content with AI');
    }
  }

  async enhanceTweet(content: string): Promise<string> {
    try {
      const prompt = `Enhance this tweet to make it more engaging and motivational while keeping it under 280 characters:

"${content}"

Return the enhanced tweet as a JSON object with a "tweet" field.`;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await this.client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert at optimizing social media content for engagement while maintaining authenticity."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 300
      });

      const result = JSON.parse(response.choices[0].message.content || '{"tweet": ""}');
      return result.tweet || content;
    } catch (error) {
      console.error('Error enhancing tweet:', error);
      throw new Error('Failed to enhance tweet with AI');
    }
  }

  async generateHashtags(content: string): Promise<string[]> {
    try {
      const prompt = `Generate 3-5 relevant hashtags for this tweet content:

"${content}"

Return the hashtags as a JSON array of strings (without the # symbol).`;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await this.client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert at social media hashtag strategy. Generate relevant, popular hashtags that will help content reach the right audience."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.5,
        max_tokens: 200
      });

      const result = JSON.parse(response.choices[0].message.content || '{"hashtags": []}');
      return result.hashtags || [];
    } catch (error) {
      console.error('Error generating hashtags:', error);
      throw new Error('Failed to generate hashtags with AI');
    }
  }
}

export const openaiService = new OpenAIService();
