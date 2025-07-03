# Supabase Setup Guide for Swarm Works

## 1. Project Configuration

Your Supabase project URL: `https://xyeluaffhayqrtmvkcgz.supabase.co`

## 2. Environment Variables Setup

### Get your Supabase credentials:

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/xyeluaffhayqrtmvkcgz
2. Navigate to Settings → API
3. Copy the following values:

```bash
# Add these to your .env.local file:
NEXT_PUBLIC_SUPABASE_URL=https://xyeluaffhayqrtmvkcgz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_public_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Database URL:

1. Go to Settings → Database
2. Find your database password or reset it
3. Use this format for your DATABASE_URL:

```bash
# For development:
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xyeluaffhayqrtmvkcgz.supabase.co:5432/postgres

# For production (Vercel):
DATABASE_URL=postgresql://postgres.xyeluaffhayqrtmvkcgz:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

## 3. Database Setup

### Run Prisma migrations:

```bash
# Generate Prisma client
npx prisma generate

# Push the schema to Supabase
npx prisma db push

# Optional: Seed the database
npx prisma db seed
```

### Enable Row Level Security (RLS):

1. Go to your Supabase dashboard
2. Navigate to Authentication → Policies
3. Enable RLS for all tables that need protection

## 4. Authentication Integration

Supabase is already integrated with NextAuth.js through the Prisma adapter. The database will automatically store:
- User sessions
- Account linking (GitHub OAuth)
- User profiles with Swarm Works specific fields

## 5. Real-time Features (Optional)

Enable real-time subscriptions for:
- Project updates
- New proposals
- Message notifications

```sql
-- Enable real-time for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Enable real-time for proposals table  
ALTER PUBLICATION supabase_realtime ADD TABLE proposals;
```

## 6. Storage Setup (Optional)

For file uploads (project attachments, profile images):

1. Go to Storage in your Supabase dashboard
2. Create buckets:
   - `avatars` (for profile images)
   - `attachments` (for project files)
   - `portfolio` (for developer portfolio files)

## 7. Database Policies

Example RLS policies to implement:

```sql
-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users
FOR SELECT USING (auth.uid()::text = id);

-- Users can update their own data
CREATE POLICY "Users can update own profile" ON users
FOR UPDATE USING (auth.uid()::text = id);

-- Projects are publicly readable when open
CREATE POLICY "Anyone can view open projects" ON projects
FOR SELECT USING (status = 'OPEN');

-- Only project owners can update their projects
CREATE POLICY "Project owners can update" ON projects
FOR UPDATE USING (auth.uid()::text = "clientId");
```

## 8. Verification Steps

1. Check database connection: `npx prisma db push`
2. Verify tables created in Supabase dashboard
3. Test authentication flow
4. Test database operations through your app

## 9. Production Deployment (Vercel)

Add these environment variables in Vercel:

```bash
DATABASE_URL=postgresql://postgres.xyeluaffhayqrtmvkcgz:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
NEXT_PUBLIC_SUPABASE_URL=https://xyeluaffhayqrtmvkcgz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXTAUTH_SECRET=your_nextauth_secret
GITHUB_ID=your_github_oauth_id
GITHUB_SECRET=your_github_oauth_secret
ARCADE_API_KEY=your_arcade_api_key
```

## 10. Monitoring

- Monitor database performance in Supabase dashboard
- Set up logging for production errors
- Monitor API usage and limits