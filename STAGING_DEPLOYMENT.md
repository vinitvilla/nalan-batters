# Staging Deployment Guide

This guide explains how to deploy your application to staging with proper database migration handling.

## 🚀 Quick Start

### For Staging Deployment with Database Updates:

```bash
# Option 1: Interactive migration (recommended for first-time or complex changes)
npm run migrate:staging:interactive

# Option 2: Automated staging deployment
npm run deploy:staging

# Option 3: Full deployment pipeline
npm run deploy:staging:full
```

## 📋 Prerequisites

1. **Staging Environment File**: Create `.env.staging` file with your staging environment variables
   ```bash
   cp .env.staging.example .env.staging
   # Edit .env.staging with your staging values
   ```

2. **Database Access**: Ensure your staging database is accessible and credentials are correct

3. **Dependencies**: Install all dependencies
   ```bash
   npm ci
   ```

## 🗄️ Database Migration Strategies

### Strategy 1: Safe Migration (Recommended for Production/Staging)
```bash
# Run interactive migration script
npm run migrate:staging:interactive
```

This script will:
- Check migration status
- Deploy pending migrations
- Handle migration drift safely
- Provide options for different scenarios

### Strategy 2: Full Reset (⚠️ DATA LOSS - Use only for development staging)
```bash
# Set your staging database URL
export DATABASE_URL_STAGING="your-staging-database-url"

# Run migration script and choose option 2
npm run migrate:staging:interactive
```

### Strategy 3: Manual Migration
```bash
# Deploy migrations directly
npm run migrate:staging

# Seed database
npm run seed:staging
```

## 🔧 Environment Setup

### Required Environment Variables for Staging:

```bash
# Database
DATABASE_URL="postgresql://user:password@staging-host:5432/database"

# App
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=staging

# Firebase (use staging project)
FIREBASE_PROJECT_ID="your-staging-project"
FIREBASE_CLIENT_EMAIL="service-account@staging-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Public Firebase config
NEXT_PUBLIC_FIREBASE_API_KEY="your-staging-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="staging-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-staging-project"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="staging-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789:web:abc123"
```

## 🚀 Deployment Process

### Full Staging Deployment:

1. **Prepare Environment**
   ```bash
   # Make sure .env.staging is configured
   cat .env.staging
   ```

2. **Run Deployment Script**
   ```bash
   # Interactive deployment (recommended)
   ./scripts/deploy-staging.sh
   
   # Or use npm script
   npm run deploy:staging
   ```

3. **Verify Deployment**
   ```bash
   # Check if staging server starts correctly
   npm run start:staging
   ```

### Manual Step-by-Step Deployment:

1. **Database Migration**
   ```bash
   npm run migrate:staging:interactive
   ```

2. **Build Application**
   ```bash
   npm run build:staging
   ```

3. **Start Staging Server**
   ```bash
   npm run start:staging
   ```

## 🔍 Troubleshooting

### Migration Issues

**Problem**: "Drift detected" or migration conflicts
```bash
# Solution 1: Use interactive migration script
npm run migrate:staging:interactive
# Choose option 3 to create drift resolution migration

# Solution 2: Deploy migrations forcefully (be careful)
npx prisma migrate deploy --force
```

**Problem**: Database connection issues
```bash
# Check if database URL is correct
echo $DATABASE_URL

# Test database connection
npx prisma db pull
```

### Build Issues

**Problem**: TypeScript/Prisma client errors
```bash
# Regenerate Prisma client
npx prisma generate

# Check for TypeScript errors
npm run lint
```

### Common Error Solutions

1. **"Cannot find Prisma Client"**
   ```bash
   npx prisma generate
   npm run build:staging
   ```

2. **"Migration file not found"**
   ```bash
   # Reset and recreate migrations
   npm run migrate:staging:interactive
   ```

3. **"Environment variable not found"**
   ```bash
   # Check .env.staging file exists and has correct values
   cat .env.staging
   ```

## 📊 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run migrate:staging` | Deploy migrations to staging |
| `npm run migrate:staging:interactive` | Interactive migration with options |
| `npm run build:staging` | Build app for staging |
| `npm run start:staging` | Start staging server |
| `npm run deploy:staging` | Run existing deployment script |
| `npm run deploy:staging:full` | Full deployment pipeline |
| `npm run seed:staging` | Seed staging database |

## 🌐 Post-Deployment

1. **Verify Application**
   - Visit your staging URL
   - Test key functionality
   - Check admin panel access

2. **Monitor Logs**
   ```bash
   # If using PM2 or similar
   pm2 logs staging-app
   
   # Or check application logs
   tail -f logs/staging.log
   ```

3. **Test Database**
   ```bash
   # Check if data was seeded correctly
   npx prisma studio --port 5556
   ```

## 🔒 Security Notes

- Never commit `.env.staging` to version control
- Use different Firebase projects for staging and production
- Ensure staging database is separate from production
- Use strong passwords and secure connections for staging database

## 📝 Next Steps

After successful staging deployment:
1. Test all functionality thoroughly
2. Run automated tests if available
3. Verify database migrations worked correctly
4. Plan production deployment strategy
