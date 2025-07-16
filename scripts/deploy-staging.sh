#!/bin/bash

# Staging Deployment Script
set -e

echo "🚀 Starting staging deployment..."

# Load staging environment variables
export NODE_ENV=production
export NEXT_PUBLIC_APP_ENV=staging

# Check if .env.staging exists
if [ ! -f ".env.staging" ]; then
    echo "❌ .env.staging file not found!"
    exit 1
fi

# Load staging environment variables
export $(cat .env.staging | xargs)

echo "📝 Environment: $NEXT_PUBLIC_APP_ENV"
echo "🗄️  Database: ${DATABASE_URL%%@*}@***"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run database migrations for staging
echo "🗃️  Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client
echo "⚙️  Generating Prisma client..."
npx prisma generate

# Build the application
echo "🔨 Building application..."
npm run build

# Seed database if needed (optional)
read -p "🌱 Do you want to seed the staging database? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Seeding database..."
    npm run seed:staging
fi

echo "✅ Staging deployment completed!"
echo "🌐 You can now start the staging server with: npm run start:staging"
