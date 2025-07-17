#!/bin/bash

# Database Migration Script for Staging
# This script handles database schema updates for staging environment

set -e

echo "🔄 Database Migration Script for Staging"
echo "========================================"

# Check if we're in staging mode
if [ "$NODE_ENV" != "staging" ] && [ -z "$DATABASE_URL_STAGING" ]; then
    echo "⚠️  Warning: This script is intended for staging deployment"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
fi

# Backup current DATABASE_URL if staging URL is provided
if [ -n "$DATABASE_URL_STAGING" ]; then
    export DATABASE_URL_BACKUP="$DATABASE_URL"
    export DATABASE_URL="$DATABASE_URL_STAGING"
    echo "🔧 Using staging database URL"
fi

# Function to restore DATABASE_URL on exit
cleanup() {
    if [ -n "$DATABASE_URL_BACKUP" ]; then
        export DATABASE_URL="$DATABASE_URL_BACKUP"
        echo "🔄 Restored original DATABASE_URL"
    fi
}
trap cleanup EXIT

echo "📊 Target database: ${DATABASE_URL%%@*}@***"

# Generate Prisma client first
echo "📝 Generating Prisma client..."
npx prisma generate

# Check current migration status
echo "🔍 Checking migration status..."
if npx prisma migrate status 2>/dev/null; then
    echo "✅ Database is in sync with migrations"
    
    # Deploy any pending migrations
    echo "🚀 Deploying migrations..."
    npx prisma migrate deploy
else
    echo "⚠️  Database drift detected or migration issues found"
    echo ""
    echo "Options:"
    echo "1. Deploy migrations (recommended for production/staging)"
    echo "2. Reset database and apply all migrations (⚠️  DATA LOSS)"
    echo "3. Create a new migration to fix drift"
    echo ""
    read -p "Choose option (1-3): " -n 1 -r
    echo
    
    case $REPLY in
        1)
            echo "🚀 Deploying migrations..."
            npx prisma migrate deploy
            ;;
        2)
            echo "⚠️  WARNING: This will delete all data in the database!"
            read -p "Are you absolutely sure? Type 'yes' to continue: " confirm
            if [ "$confirm" = "yes" ]; then
                echo "🔄 Resetting database..."
                npx prisma migrate reset --force
                echo "🌱 Seeding database..."
                node seed.js
            else
                echo "Aborted."
                exit 1
            fi
            ;;
        3)
            echo "📝 Creating migration to resolve drift..."
            npx prisma migrate dev --create-only --name resolve_schema_drift
            echo "✏️  Please review the generated migration file and run this script again"
            exit 0
            ;;
        *)
            echo "Invalid option. Aborted."
            exit 1
            ;;
    esac
fi

# Verify final state
echo "✅ Verifying migration status..."
npx prisma migrate status

echo ""
echo "🎉 Database migration completed successfully!"
echo "📊 Database is now ready for staging deployment"
