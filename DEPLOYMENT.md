# StumbleLele Deployment Guide

## Vercel + Supabase Deployment

This guide will help you deploy StumbleLele to Vercel with Supabase as the database.

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
3. **AI API Keys**: Get your API keys from:
   - [OpenAI](https://platform.openai.com/api-keys)
   - [XAI](https://x.ai)
   - [Anthropic](https://console.anthropic.com/)

### Step 1: Set up Supabase Database

1. Create a new project in Supabase
2. Go to **Settings > Database**
3. Copy the connection string (it looks like):
   ```
   postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
   ```
4. Replace `[PASSWORD]` with your actual database password
5. Save this connection string for later

### Step 2: Run Database Migrations

1. Create a `.env` file in your project root:
   ```env
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
   OPENAI_API_KEY=your_openai_api_key_here
   XAI_API_KEY=your_xai_api_key_here
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ```

2. Install dependencies and run migrations:
   ```bash
   npm install
   npm run db:push
   ```

### Step 3: Deploy to Vercel

1. **Connect Repository**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**:
   - In the Vercel dashboard, go to your project settings
   - Navigate to "Environment Variables"
   - Add the following variables:
     ```
     DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
     XAI_API_KEY=your_xai_api_key_here
     NODE_ENV=production
     ```

3. **Deploy**:
   - Click "Deploy"
   - Vercel will automatically build and deploy your application

### Step 4: Configure Domain (Optional)

1. In Vercel dashboard, go to your project
2. Navigate to "Settings > Domains"
3. Add your custom domain if desired

### Database Schema

The application uses the following tables:
- `users` - User profiles and preferences
- `conversations` - Chat history with Lele
- `memories` - AI-generated memories from conversations
- `friends` - Virtual friends system
- `game_progress` - Game scores and achievements
- `avatar_state` - Lele's emotional state and personality

### Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Supabase PostgreSQL connection string | Yes |
| `XAI_API_KEY` | XAI API key for AI features | Yes |
| `NODE_ENV` | Environment (production/development) | Yes |

### Troubleshooting

1. **Database Connection Issues**:
   - Verify your DATABASE_URL is correct
   - Check that your Supabase project is active
   - Ensure the database password is correct

2. **Build Failures**:
   - Check that all environment variables are set in Vercel
   - Verify that dependencies are properly installed
   - Check build logs in Vercel dashboard

3. **Runtime Errors**:
   - Check function logs in Vercel dashboard
   - Verify XAI API key is valid
   - Ensure database migrations have been run

### Local Development

To run locally with the production database:

1. Copy `.env.example` to `.env`
2. Add your Supabase DATABASE_URL and XAI_API_KEY
3. Run:
   ```bash
   npm install
   npm run db:push
   npm run dev
   ```

### Production Considerations

1. **Database Backups**: Supabase automatically backs up your database
2. **Monitoring**: Use Vercel Analytics and Supabase monitoring
3. **Scaling**: Both Vercel and Supabase scale automatically
4. **Security**: All environment variables are encrypted in Vercel

### Support

For deployment issues:
- Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
- Check Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
- Review application logs in both platforms