# Deployment Guide for Twitter Motivation Bot

Follow these steps to deploy your Twitter motivation bot to GitHub and Vercel.

## Step 1: Prepare Files for GitHub

Download these files from your current project and upload them to GitHub:

### Required Files:
- `package.json` (contains all dependencies and build scripts)
- `package-lock.json` (dependency lock file)
- `tsconfig.json` (TypeScript configuration)
- `tailwind.config.ts` (Tailwind CSS configuration)
- `postcss.config.js` (PostCSS configuration)
- `vite.config.ts` (Vite build configuration)
- `drizzle.config.ts` (Database configuration)
- `vercel.json` (Vercel deployment configuration)
- `.gitignore` (Git ignore file)
- `README.md` (Project documentation)

### Required Directories:
- `client/` (entire React frontend)
- `server/` (entire Express backend)
- `shared/` (shared schemas and types)
- `components.json` (UI components configuration)

### DO NOT UPLOAD:
- `node_modules/` (will be installed during deployment)
- `.env` files (environment variables set in Vercel)
- `dist/` or `build/` folders (generated during deployment)
- `attached_assets/` (old Next.js files not needed)

## Step 2: Create GitHub Repository

1. Go to [github.com](https://github.com) and create a new repository
2. Name it something like `twitter-motivation-bot`
3. Initialize it as public or private (your choice)
4. Upload all the required files and directories listed above
5. Commit and push your code

## Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click "New Project"
4. Import your GitHub repository
5. Configure these settings:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
   - **Node.js Version**: 18.x or 20.x

## Step 4: Set Environment Variables in Vercel

In your Vercel project dashboard, go to Settings > Environment Variables and add:

```
DATABASE_URL=your_postgresql_database_url
OPENAI_API_KEY=your_openai_api_key
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_twitter_access_token_secret
SESSION_SECRET=a_random_secure_string_for_sessions
REPL_ID=your_vercel_app_name
REPLIT_DOMAINS=your-app-name.vercel.app
ISSUER_URL=https://replit.com/oidc
```

## Step 5: Database Setup

You'll need a PostgreSQL database for production. Recommended providers:

### Option A: Neon (Recommended)
1. Go to [neon.tech](https://neon.tech)
2. Create a free account
3. Create a new database
4. Copy the connection string
5. Add it as `DATABASE_URL` in Vercel

### Option B: Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a project
3. Get the database URL from Settings > Database
4. Add it as `DATABASE_URL` in Vercel

### Option C: PlanetScale
1. Go to [planetscale.com](https://planetscale.com)
2. Create a database
3. Get the connection string
4. Add it as `DATABASE_URL` in Vercel

## Step 6: Deploy and Test

1. After setting up environment variables, trigger a new deployment in Vercel
2. Wait for the build to complete
3. Visit your deployed URL (something like `your-app.vercel.app`)
4. Test the login and bot functionality

## Troubleshooting

### Build Issues
- Ensure all files are uploaded correctly
- Check that environment variables are set
- Verify the build logs in Vercel dashboard

### Database Issues
- Make sure DATABASE_URL is correct
- Verify the database provider allows external connections
- Check if you need to run migrations

### Authentication Issues
- Ensure REPLIT_DOMAINS matches your Vercel URL
- Verify all auth-related environment variables are set
- Check that the domain is correctly configured

### API Issues
- Verify Twitter API credentials are valid
- Check OpenAI API key has sufficient credits
- Ensure all API keys have proper permissions

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| OPENAI_API_KEY | OpenAI API key | `sk-...` |
| TWITTER_API_KEY | Twitter API consumer key | `abc123...` |
| TWITTER_API_SECRET | Twitter API consumer secret | `def456...` |
| TWITTER_ACCESS_TOKEN | Twitter access token | `123-abc...` |
| TWITTER_ACCESS_TOKEN_SECRET | Twitter access token secret | `ghi789...` |
| SESSION_SECRET | Random string for sessions | `random-secure-string` |
| REPL_ID | Your app identifier | `your-app-name` |
| REPLIT_DOMAINS | Your domain for auth | `your-app.vercel.app` |

## Post-Deployment

After successful deployment:
1. Log in to your app
2. Configure bot settings
3. Generate some test content
4. Monitor the activity logs
5. Set up your preferred posting schedule

Your Twitter motivation bot is now live and ready to inspire your audience!