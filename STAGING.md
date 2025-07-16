# Staging Environment Setup

This document describes how to set up and use the staging environment for Nalan Batters.

## Prerequisites

- Node.js (v18+)
- PostgreSQL
- All production dependencies

## Quick Setup

1. **Copy environment file:**
   ```bash
   cp .env.staging.example .env.staging
   ```

2. **Update environment variables** in `.env.staging` with your staging values

3. **Set up staging database:**
   ```bash
   ./scripts/setup-staging-db.sh
   ```

4. **Deploy to staging:**
   ```bash
   ./scripts/deploy-staging.sh
   ```

5. **Start staging server:**
   ```bash
   ./scripts/start-staging.sh
   ```

## Manual Setup

### 1. Environment Configuration

Create `.env.staging` with staging-specific values:
- Separate database for staging
- Staging Firebase project (optional)
- Test API keys
- Debug flags enabled

### 2. Database Setup

```bash
# Create staging database
createdb nalan-batters-staging

# Run migrations
npm run migrate:staging

# Seed database (optional)
npm run seed:staging
```

### 3. Build and Deploy

```bash
# Build for staging
npm run build:staging

# Start staging server
npm run start:staging
```

## Available Scripts

- `npm run build:staging` - Build app for staging
- `npm run start:staging` - Start staging server
- `npm run migrate:staging` - Run database migrations
- `npm run seed:staging` - Seed staging database
- `npm run db:setup:staging` - Setup database (migrate + seed)

## Environment URLs

- **Development:** http://localhost:3000
- **Staging:** http://localhost:3001
- **Production:** (configured in production environment)

## Environment Badge

The staging environment displays a yellow "STAGING" badge in the top-right corner to distinguish it from production.

## Database Management

### Backup Staging Database
```bash
pg_dump nalan-batters-staging > staging-backup-$(date +%Y%m%d_%H%M%S).sql
```

### Restore from Backup
```bash
dropdb nalan-batters-staging
createdb nalan-batters-staging
psql nalan-batters-staging < staging-backup-YYYYMMDD_HHMMSS.sql
```

### Reset Staging Database
```bash
dropdb nalan-batters-staging
./scripts/setup-staging-db.sh
```

## Testing

Use staging to test:
- New features before production
- Database migrations
- API integrations
- User acceptance testing
- Performance testing

## Monitoring

Staging includes:
- Debug logging enabled
- Console warnings visible
- Environment badge visible
- Detailed error messages

## Security Notes

- Use separate API keys for staging
- Don't use production credentials
- Staging data should be test data only
- Consider using a separate Firebase project

## Troubleshooting

### Port Already in Use
If port 3001 is busy:
```bash
# Find process using port 3001
lsof -i :3001

# Kill the process (replace PID)
kill -9 PID

# Or use a different port
PORT=3002 npm run start:staging
```

### Database Connection Issues
1. Ensure PostgreSQL is running
2. Check DATABASE_URL in .env.staging
3. Verify database exists
4. Check user permissions

### Build Errors
1. Clear Next.js cache: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check environment variables are set correctly
