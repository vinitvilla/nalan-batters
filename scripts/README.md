# Databas**Features:**
- Creates 50 mock users with realistic names and Canadian addresses
- Properly formatted Canadian phone numbers (+1XXXXXXXXXX format)
- Automatically truncates existing mock data (preserves system users/addresses)
- Generates 90 days of historical order data (1800+ orders)
- Simulates realistic order patterns:ripts

This directory contains scripts for database management and data population.

## Available Scripts

### `populate-db.js`
Generates realistic mock data for development and testing purposes.

**Features:**
- Creates 50 mock users with realistic names and addresses
- Generates 90 days of historical order data (1900+ orders)
- Simulates realistic order patterns:
  - Peak hours (lunch/dinner times)
  - Weekend vs weekday patterns
  - Seasonal variations
- Realistic order distributions:
  - 70% delivery, 30% pickup
  - 75% online payment, 25% cash
  - 60% delivered, 15% confirmed, 10% shipped, 10% pending, 5% cancelled
- Updates product stock levels randomly

**Usage:**
```bash
# Using npm scripts (recommended)
npm run populate                    # Populate development database
npm run populate:fresh             # Seed + populate (ensures system data exists)

# Direct execution
node scripts/populate-db.js

# Full database setup with seed + populate
npm run db:setup:full              # Development
```

**Configuration:**
Edit the `CONFIG` object in `populate-db.js` to adjust:
- Number of users to create
- Days of historical data
- Order frequency patterns
- Status distributions

**Output:**
- 50 users with 80+ addresses
- 1900+ realistic orders over 90 days
- Updated product stock levels
- Comprehensive analytics data for dashboard

## Dashboard Integration

After running the populate script, the admin dashboard will display:
- Rich analytics with real data patterns
- Revenue trends and growth metrics
- Order distribution charts
- Product performance analytics
- Time-based order patterns

Navigate to `/admin/dashboard` to view the populated analytics.
