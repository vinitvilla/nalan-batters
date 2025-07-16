# Vercel Staging Deployment Guide

## 🚀 Quick Setup Instructions

### 1. Vercel Project Setup

#### Create Staging Project in Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your repository
4. **Project Name**: `nalan-batters-staging`
5. **Git Branch**: `staging` (important!)
6. **Root Directory**: `./` (default)
7. **Framework**: Next.js (auto-detected)

#### Environment Variables in Vercel Dashboard
Go to Project Settings → Environment Variables and add:

```env
NEXT_PUBLIC_APP_ENV=staging
NODE_ENV=production
DATABASE_URL=your-staging-database-url
NEXT_PUBLIC_FIREBASE_API_KEY=your-staging-firebase-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-staging-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-staging-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-staging-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-staging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-staging-app-id
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
NEXT_PUBLIC_BASE_URL=https://nalan-batters-staging.vercel.app
```

### 2. Database Setup for Staging

#### Option A: Separate Staging Database (Recommended)
- Create a new PostgreSQL database for staging
- Use the same schema as production
- Populate with test data

#### Option B: Use Current Premium Database
- Continue using your current staging database
- Just point Vercel to the same `DATABASE_URL`

### 3. Deploy to Staging

```bash
# Make changes
git checkout staging
git merge main  # or merge your feature branch
git push origin staging
```

**Result**: Auto-deploys to `https://nalan-batters-staging.vercel.app`

---

## 🔄 Development Workflow

### Daily Development Flow
```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes and commit
git add .
git commit -m "Add new feature"

# 3. Push for preview deployment
git push origin feature/new-feature
# → Creates automatic preview deployment

# 4. Deploy to staging for testing
git checkout staging
git merge feature/new-feature
git push origin staging
# → Deploys to staging.yourdomain.com

# 5. After testing, deploy to production
git checkout main
git merge staging
git push origin main
# → Deploys to production
```

### Environment Promotion Flow
```
Development → Preview → Staging → Production
     ↓           ↓         ↓         ↓
Feature     Auto-     Staging    Production
Branch      Preview   Testing    Release
```

---

## 🎯 Advantages of This Approach

### ✅ **Automated Deployments**
- Push to `staging` branch = instant deployment
- No manual build/upload process
- Preview deployments for every feature branch

### ✅ **Environment Isolation**
- Separate databases and configurations
- Different Firebase projects for staging/production
- Independent scaling and performance monitoring

### ✅ **Team Collaboration**
- Shared staging environment for testing
- Easy to share staging URLs with stakeholders
- QA team can test before production

### ✅ **Zero-Downtime Deployments**
- Vercel handles blue-green deployments
- Instant rollback capability
- Automatic HTTPS and CDN

### ✅ **Cost Effective**
- Vercel's hobby plan supports multiple projects
- Only pay for actual usage
- Automatic scaling based on traffic

---

## 🔧 Advanced Configuration

### Custom Domain for Staging
1. In Vercel dashboard: Settings → Domains
2. Add: `staging.yourdomain.com`
3. Update DNS records as instructed

### Build Command Optimization
```json
// vercel.json
{
  "buildCommand": "npm run build:staging",
  "devCommand": "npm run dev:staging",
  "installCommand": "npm install"
}
```

### Prisma Configuration for Vercel
**Important**: Vercel caches dependencies which can cause Prisma Client issues.

**Required package.json scripts:**
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "build:staging": "prisma generate && NEXT_PUBLIC_APP_ENV=staging NODE_ENV=production next build",
    "postinstall": "prisma generate"
  }
}
```

**Why this is needed:**
- `postinstall`: Generates Prisma Client after npm install
- `prisma generate` in build: Ensures latest client during build
- Prevents "outdated Prisma Client" errors on Vercel

### Environment-Specific Redirects
```json
// vercel.json
{
  "redirects": [
    {
      "source": "/admin",
      "destination": "/admin/dashboard",
      "permanent": false
    }
  ]
}
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Environment Variables Not Loading
**Problem**: `NEXT_PUBLIC_APP_ENV` shows `undefined`
**Solution**: 
- Verify environment variables in Vercel dashboard
- Ensure `NEXT_PUBLIC_` prefix for client-side variables
- Redeploy after adding environment variables

#### 2. Database Connection Issues
**Problem**: API routes fail with database errors
**Solution**:
- Check `DATABASE_URL` in Vercel environment variables
- Ensure database allows connections from Vercel IPs
- Test connection with Prisma Studio

#### 3. Build Failures
**Problem**: Deployment fails during build
**Solution**:
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript and ESLint configuration

#### 4. Prisma Client Issues
**Problem**: "Prisma has detected that this project was built on Vercel" error
**Solution**:
- Add `"postinstall": "prisma generate"` to package.json scripts
- Include `prisma generate &&` in build commands
- Ensure `DATABASE_URL` is set in Vercel environment variables
- Redeploy after making these changes

#### 5. Environment Badge Not Showing
**Problem**: Badge shows wrong environment or doesn't appear
**Solution**:
- Verify `NEXT_PUBLIC_APP_ENV=staging` in Vercel
- Check browser console for environment logs
- Ensure badge component is imported in layout

---

## 🚦 Deployment Checklist

### Before First Deployment
- [ ] Create staging branch
- [ ] Set up Vercel project connected to staging branch
- [ ] Configure all environment variables
- [ ] Set up staging database
- [ ] Test local staging build
- [ ] Verify environment badge appears

### For Each Deployment
- [ ] Test changes locally
- [ ] Deploy to staging first
- [ ] Verify staging deployment works
- [ ] Test critical user flows
- [ ] Check environment badge shows "STAGE"
- [ ] Verify database connections
- [ ] Test API endpoints
- [ ] Only then deploy to production

---

## 📊 Monitoring and Analytics

### Vercel Analytics
- Separate analytics for staging vs production
- Monitor performance and errors
- Track deployment frequency

### Database Monitoring
- Monitor staging database performance
- Set up alerts for connection issues
- Regular backup of staging data

### Log Monitoring
- Use Vercel Function logs for debugging
- Set up error tracking (Sentry, etc.)
- Monitor API response times

---

This approach gives you a professional, scalable staging environment that integrates seamlessly with your development workflow!
