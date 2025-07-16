# Port Configuration Guide

## Environment Port Setup

This document outlines the port configuration for different environments in the Nalan Batters application.

## Port Assignments

| Environment | Port | URL | Purpose |
|-------------|------|-----|---------|
| **Local Development** | 3000 | http://localhost:3000 | Daily development work |
| **Staging** | 8080 | http://localhost:8080 | Testing and staging |
| **Production** | Variable | https://yourdomain.com | Live production site |

## Scripts and Commands

### Local Development (Port 3000)
```bash
# Start development server
npm run dev
# Runs: next dev --turbopack --port 3000

# Start production build locally
npm run start
# Runs: next start --port 3000
```

### Staging (Port 8080)
```bash
# Build staging
npm run build:staging
# Runs: prisma generate && NEXT_PUBLIC_APP_ENV=staging NODE_ENV=production next build

# Start staging server
npm run start:staging
# Runs: NEXT_PUBLIC_APP_ENV=staging NODE_ENV=production next start --port 8080
```

## Environment Variables

### .env.local (Development - Port 3000)
```env
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres@localhost:5432/nalan-batters?schema=public
# ... other local configs
```

### .env.staging (Staging - Port 8080)
```env
NEXT_PUBLIC_APP_ENV=staging
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
DATABASE_URL=postgres://premium-staging-db-url
# ... other staging configs
```

## Environment Badge Display

| Environment | Badge Text | Color |
|-------------|------------|-------|
| Development | "DEV" | Blue |
| Staging | "STAGE" | Yellow |
| Production | (Hidden) | N/A |

## Testing Both Environments

### Quick Health Check
```bash
# Test local development (port 3000)
curl http://localhost:3000/api/public/config

# Test staging (port 8080)
curl http://localhost:8080/api/public/config
```

### API Endpoint Testing
```bash
# Local products API
curl http://localhost:3000/api/public/products

# Staging products API
curl http://localhost:8080/api/public/products
```

## Usage Scenarios

### Daily Development Workflow
1. **Local Development (3000)**: Primary development, hot reloading, debugging
2. **Staging (8080)**: Testing production builds, integration testing, demos

### Team Collaboration
- **Developers**: Use local development on port 3000
- **QA/Testers**: Use staging environment on port 8080
- **Stakeholders**: Access staging for review and feedback

### Deployment Testing
1. Test locally on port 3000 first
2. Build and test staging on port 8080
3. Deploy to production after staging validation

## Port Conflict Resolution

### If Port 3000 is Busy
```bash
# Kill processes on port 3000
lsof -ti:3000 | xargs kill -9

# Or start on different port
npm run dev -- --port 3001
```

### If Port 8080 is Busy
```bash
# Kill processes on port 8080
lsof -ti:8080 | xargs kill -9

# Or modify staging script to use different port
npm run start:staging -- --port 8081
```

## Vercel Deployment

When deploying to Vercel:
- **Staging Branch**: Auto-deploys to staging.yourdomain.com
- **Main Branch**: Auto-deploys to yourdomain.com
- **Feature Branches**: Auto-generate preview URLs

## Benefits of This Setup

✅ **Clear Separation**: Different ports prevent environment confusion  
✅ **Parallel Development**: Run both environments simultaneously  
✅ **Realistic Testing**: Staging uses production builds and settings  
✅ **Team Workflow**: Developers and testers can work independently  
✅ **Easy Switching**: Simple URLs to remember and share  

## Troubleshooting

### Environment Badge Not Showing Correctly
- Check `NEXT_PUBLIC_APP_ENV` in respective environment files
- Verify browser console for environment detection logs
- Ensure environment files are loaded correctly

### API Calls Failing
- Verify `NEXT_PUBLIC_API_BASE_URL` matches the port
- Check database connectivity
- Ensure Prisma client is generated

### Port Already in Use
- Use `lsof -ti:PORT | xargs kill -9` to kill processes
- Check for other Next.js instances running
- Verify no Docker containers using the ports

This configuration provides a clean, professional development workflow with clear environment separation and easy team collaboration.
