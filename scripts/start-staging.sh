#!/bin/bash

# Start Staging Server Script
set -e

# Load staging environment variables
if [ -f ".env.staging" ]; then
    export $(cat .env.staging | xargs)
else
    echo "❌ .env.staging file not found!"
    exit 1
fi

# Set Node environment
export NODE_ENV=production
export PORT=3001

echo "🚀 Starting staging server..."
echo "🌐 Environment: $NEXT_PUBLIC_APP_ENV"
echo "🔗 Server will be available at: http://localhost:$PORT"
echo "📊 Database: ${DATABASE_URL%%@*}@***"
echo ""

# Start the Next.js server
npm start
