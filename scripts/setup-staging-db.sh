#!/bin/bash

# Staging Database Setup Script
set -e

echo "🗄️  Setting up staging database..."

# Load environment variables
if [ -f ".env.staging" ]; then
    export $(cat .env.staging | xargs)
else
    echo "❌ .env.staging file not found!"
    exit 1
fi

# Extract database name from PRISMA_MIGRATION_URL
DB_NAME=$(echo $PRISMA_MIGRATION_URL | sed 's/.*\/\([^?]*\).*/\1/')

echo "📝 Database name: $DB_NAME"

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    exit 1
fi

# Create staging database if it doesn't exist
echo "🔧 Creating staging database if it doesn't exist..."
createdb "$DB_NAME" 2>/dev/null || echo "Database $DB_NAME already exists"

# Run migrations
echo "🔄 Running Prisma migrations..."
npx prisma migrate deploy

# Generate Prisma client
echo "⚙️  Generating Prisma client..."
npx prisma generate

echo "✅ Staging database setup completed!"
echo "🗄️  Database: $DB_NAME"
echo "🔗 Connection: ${PRISMA_MIGRATION_URL%%@*}@***"
