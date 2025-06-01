# Twitter Motivation Bot

A full-stack application that automatically generates and posts motivational content to Twitter using AI-powered content generation.

## Features

- **AI Content Generation**: Uses OpenAI to create engaging motivational tweets
- **Smart Scheduling**: Automatically schedule and post content at optimal times
- **Analytics Dashboard**: Track engagement and monitor bot performance
- **User Authentication**: Secure login with Replit Auth
- **Real-time Monitoring**: Live activity logs and performance metrics
- **Customizable Settings**: Configure posting frequency, topics, and automation

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth (OpenID Connect)
- **AI**: OpenAI GPT-4o
- **Social Media**: Twitter API v2
- **Deployment**: Vercel

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Database
   DATABASE_URL="your_postgresql_url"
   
   # OpenAI
   OPENAI_API_KEY="your_openai_api_key"
   
   # Twitter API
   TWITTER_API_KEY="your_twitter_api_key"
   TWITTER_API_SECRET="your_twitter_api_secret"
   TWITTER_ACCESS_TOKEN="your_twitter_access_token"
   TWITTER_ACCESS_TOKEN_SECRET="your_twitter_access_token_secret"
   
   # Authentication
   SESSION_SECRET="your_session_secret"
   REPL_ID="your_repl_id"
   REPLIT_DOMAINS="your_domain.com"
   ```

4. Set up the database:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment to Vercel

### Step 1: Prepare Your GitHub Repository

1. Create a new repository on GitHub
2. Upload your project files (excluding node_modules and .env files)
3. Commit and push your code

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project" and import your GitHub repository
3. Configure the following settings:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 3: Environment Variables

Add these environment variables in Vercel dashboard:

```
DATABASE_URL=your_postgresql_url
OPENAI_API_KEY=your_openai_api_key
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_twitter_access_token_secret
SESSION_SECRET=your_session_secret
REPL_ID=your_repl_id
REPLIT_DOMAINS=your_vercel_domain.vercel.app
```

### Step 4: Database Setup

1. Create a PostgreSQL database (recommended: Neon, Supabase, or PlanetScale)
2. Update the DATABASE_URL in Vercel
3. Run database migrations in Vercel's terminal or locally with production database

## API Credentials Setup

### Twitter API
1. Go to [developer.twitter.com](https://developer.twitter.com)
2. Create a new app
3. Generate API keys and access tokens
4. Enable read and write permissions

### OpenAI API
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an account and get API key
3. Add billing information for API usage

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
├── server/                # Express backend
│   ├── services/          # Business logic services
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   └── index.ts           # Server entry point
├── shared/                # Shared types and schemas
└── drizzle.config.ts      # Database configuration
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details