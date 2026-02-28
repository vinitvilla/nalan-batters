# Nalan Batters

A comprehensive e-commerce web application built with Next.js, TypeScript, and Prisma ORM. Features modern UI, user authentication, product management, cart functionality, admin dashboard, and a complete Point-of-Sale (POS) system.

## Project Overview

Nalan Batters is a full-stack web application built with Next.js 15, TypeScript, and Prisma ORM. It features a modern UI, supports user authentication, product management, cart functionality, and comprehensive admin features including a POS system. The project uses Firebase for authentication and admin operations, and Prisma (with Prisma Accelerate support) for database access and migrations.

### Key Features

- **Next.js App Router**: Uses the `/app` directory structure for routing
- **TypeScript**: Type-safe codebase with organized type definitions in `/src/types`
- **Prisma ORM**: Database schema and migrations managed in `/prisma`, with Prisma Accelerate support
- **Firebase Admin SDK**: For secure admin operations and authentication
- **Firebase Cloud Messaging (FCM)**: Push notification support for admin alerts
- **Modern UI Components**: Located in `/src/components` and `/src/components/ui`
- **Cart & Checkout**: Cart state managed in `/src/store/cartStore.ts`, with checkout flow
- **Pickup & Delivery Orders**: Dual order types with conditional checkout flow and charge management
- **Admin Dashboard**: Complete admin interface with analytics and management
- **POS System**: Point-of-sale system with customer lookup and order management
- **Delivery & Driver Management**: Dedicated driver roles and delivery assignment features
- **Google Maps Integration**: For visualization of delivery locations and routes
- **Comprehensive Testing**: Setup with Vitest for unit, API, and UI components test coverage
- **Phone Number Standardization**: Automatic phone number formatting to +1XXXXXXXXXX format
- **User Authentication**: Phone-based user auth flow with OTP verification
- **Reusable Hooks**: Custom hooks for authentication, data fetching, and state management
- **API Routes**: Organized REST API under `/src/app/api`
- **Service Layer**: Business logic services in `/src/services`
- **Database Seeding**: Comprehensive seed scripts for initial data
- **SEO Optimized**: Sitemap, structured data, robots.txt, and metadata configuration
- **PWA Ready**: Web app manifest and app icons included
- **Rate Limiting**: API rate limiting with `rate-limiter-flexible`
- **Global Styles**: TailwindCSS with custom styling
- **Font Optimization**: Uses Geist font via `next/font`

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Firebase project with Admin SDK credentials

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd nalan-batters

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in all required values in .env

# Run database migrations
npm run migrate

# Seed the database
npm run seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

### Development
- `npm run dev` - Start development server with Turbopack on port 3000
- `npm run build` - Run tests, generate Prisma client, and build for production
- `npm run build:ci` - Generate Prisma client and build (skips test run, for CI)
- `npm run start` - Start production server on port 3000
- `npm run lint` - Run ESLint

### Testing
- `npm run test` - Run all tests with Vitest (watch mode)
- `npm run test:ci` - Run tests in CI mode (non-interactive)
- `npm run test:ui` - Run component and UI tests specifically
- `npm run test:api` - Run API endpoint tests

### Database
- `npm run migrate` - Run Prisma database migrations
- `npm run seed` - Seed database with initial data (`seed.ts`)
- `npm run populate` - Populate database with extended test data
- `npm run populate:fresh` - Alias for `populate`
- `npm run db:setup` - Run migrations and seed data
- `npm run db:setup:full` - Reset database, re-seed, and fully populate

## Complete Project Structure

### Root Directory
```
├── .env                          # Environment variables (local)
├── .env.example                  # Example environment file (template)
├── .env.production               # Production environment variables
├── .env.production.example       # Example production environment file
├── .env.staging.example          # Example staging environment file
├── .env.test.example             # Example test environment file
├── .gitignore                    # Git ignore rules
├── README.md                     # Project documentation
├── components.json               # shadcn/ui components configuration
├── eslint.config.mjs             # ESLint configuration
├── instrumentation.ts            # Next.js instrumentation (OpenTelemetry)
├── next-env.d.ts                 # Next.js TypeScript definitions
├── next.config.ts                # Next.js configuration
├── package.json                  # Project dependencies and scripts
├── package-lock.json             # Dependency lock file
├── postcss.config.mjs            # PostCSS configuration
├── seed.ts                       # Database seed entry point
├── tailwind.config.ts            # TailwindCSS configuration
├── tsconfig.json                 # TypeScript configuration
├── vercel.json                   # Vercel deployment configuration
├── vitest.config.ts              # Vitest test configuration
└── vitest.setup.ts               # Vitest test setup
```

### Source Directory (`/src`)
```
src/
├── middleware.ts               # Next.js middleware (auth & routing)
├── app/                       # Next.js App Router directory
├── components/                # React components
├── constants/                 # Application constants
├── generated/                 # Generated files (Prisma client)
├── hooks/                     # Custom React hooks
├── lib/                       # Utility libraries and functions
├── services/                  # Business logic service layer
├── store/                     # State management (Zustand stores)
├── styles/                    # Additional styles
└── types/                     # TypeScript type definitions
```

### App Directory (`/src/app`)
```
app/
├── favicon.ico                # Application favicon
├── globals.css                # Global CSS styles
├── home-client.tsx            # Client-side home page component
├── layout-client.tsx          # Client-side root layout wrapper
├── layout.tsx                 # Root layout component
├── page.tsx                   # Home page component
├── sitemap.ts                 # Dynamic sitemap generation
├── admin/                     # Admin dashboard pages
├── api/                       # API routes
├── checkout/                  # Checkout flow pages
├── delivery/                  # Delivery tracking pages
├── order-success/             # Order confirmation page
├── route/                     # Custom route handlers
├── settings/                  # User settings pages
└── signin/                    # Authentication pages
```

### Admin Dashboard (`/src/app/admin`)
```
admin/
├── layout.tsx                 # Admin layout with navigation
├── page.tsx                   # Admin dashboard home
├── use-admin-api.ts           # Admin API utilities
├── use-case-doc.js            # Documentation utilities
├── billing-pos/               # Point-of-sale system
├── components/                # Admin-specific components
├── contact-messages/          # Contact message management
├── dashboard/                 # Main dashboard analytics
├── delivery/                  # Delivery management
├── feature-flags/             # Feature flag management
├── orders/                    # Order management
├── payments/                  # Payments monitoring and configurations
├── pos-orders/                # POS order history
├── products/                  # Product management
├── promo-codes/               # Promotional code management
├── settings/                  # Admin settings
└── users/                     # User management
```

### API Routes (`/src/app/api`)
```
api/
├── admin/                     # Admin-only API endpoints
│   ├── billing/               # Billing summary API
│   ├── categories/            # Category management API
│   ├── config/                # Configuration API
│   ├── contact-messages/      # Contact message API
│   ├── dashboard/             # Dashboard analytics API
│   ├── fcm-token/             # FCM push token API
│   ├── feature-flags/         # Feature flag API
│   ├── notifications/         # Admin notifications API
│   ├── orders/                # Order management API
│   ├── pos/                   # POS system API
│   ├── products/              # Product management API
│   ├── promoCodes/            # Promo code API
│   └── users/                 # User management API
├── driver/                    # Driver API endpoints
├── google-reviews/            # Google Reviews integration
├── public/                    # Public API endpoints
│   ├── addresses/             # Address management
│   ├── cart/                  # Shopping cart API
│   ├── config/                # Public configuration
│   ├── contact/               # Contact form API
│   ├── me/                    # User profile API
│   ├── orders/                # Order placement API
│   ├── products/              # Product catalog API
│   ├── promoCodes/            # Promo code validation
│   └── users/                 # User registration/auth
├── route/                     # Custom route handlers
└── user/                      # User-specific API endpoints
```

### Components (`/src/components`)
```
components/
├── AdditionalChargesForm.tsx    # Additional charges configuration form
├── AddressForm.tsx              # Address input component
├── AvailableStores.tsx          # Multi-store location selector
├── CartButton.tsx               # Shopping cart button
├── CartDropdown.tsx             # Cart dropdown menu
├── CartToast.tsx                # Cart notification toasts
├── CheckoutContactDelivery.tsx  # Checkout delivery form
├── ChooseDeliveryDate.tsx       # Delivery date picker
├── ContactSection.tsx           # Contact information section
├── DeliveryMapView.tsx          # Google Maps interface for delivery
├── DeliveryPartnerSection.tsx   # Management for third party delivery
├── EnvironmentBadge.tsx         # Environment indicator
├── FeaturesSection.tsx          # Product features section
├── Footer.tsx                   # Site footer
├── FreeDeliveryForm.tsx         # Free delivery schedule configuration form
├── FreeDeliverySchedule.tsx     # Delivery schedule display
├── GoldButton.tsx               # Styled button component
├── Header.tsx                   # Site header
├── HeroSection.tsx              # Landing page hero
├── MainNav.tsx                  # Main navigation
├── OpeningHours.tsx             # Business hours display
├── OperatingHoursForm.tsx       # Operating hours configuration form
├── OrderSummary.tsx             # Order summary component
├── OrderTypeSelector.tsx        # Select between delivery or pickup
├── PermissionWrapper.tsx        # Role-based access control
├── ProductList.tsx              # Product listing component
├── QuickOrderSection.tsx        # Quick order interface
├── SessionHydrator.tsx          # Session state hydration
├── StructuredData.tsx           # JSON-LD structured data for SEO
├── TestimonialsSection.tsx      # Customer testimonials
├── UserDropdown.tsx             # User menu dropdown
├── UserLoginButton.tsx          # Login/logout button
├── auth/                        # Authentication components
├── mobile/                      # Mobile-optimized components
├── shared/                      # Common generic UI components
└── ui/                          # Reusable UI components (shadcn/ui)
```

### Service Layer (`/src/services`)
```
services/
├── config/                    # Configuration service logic
├── order/                     # Order processing service logic
└── user/                      # User service logic
```

### State Management (`/src/store`)
```
store/
├── addressStore.ts            # Address management state
├── cartStore.ts               # Shopping cart state
├── configStore.ts             # Application configuration state
├── contactMessagesStore.ts    # Contact messages state
├── notificationStore.ts       # Notification/FCM state
├── orderStore.ts              # Order management state
├── productStore.ts            # Product catalog state
└── userStore.ts               # User authentication state
```

### Custom Hooks (`/src/hooks`)
```
hooks/
├── index.ts                   # Central hook exports
├── use-mobile.ts              # Mobile device detection
├── useAdminAuth.ts            # Admin authentication hook
├── useAdminFCM.ts             # FCM push notification hook for admin
├── useBillingData.ts          # Billing data fetching
├── useDebounce.ts             # Debounce utility hook
├── useNewMessagesCount.ts     # Message count tracking
├── useOrderFilters.ts         # Order filtering/sorting hook
├── useOrderPlacement.ts       # Order placement logic hook
├── usePosData.ts              # POS data management
├── usePromoCode.ts            # Promo code validation hook
├── useSignOut.ts              # User sign-out functionality
└── useUserRole.ts             # User role resolution hook
```

### Utilities (`/src/lib`)
```
lib/
├── auth-guard.ts              # Route/action authentication guard
├── events/                    # Event utilities
├── firebase/                  # Firebase integration
├── hydrateUserFromApi.ts      # User data hydration
├── metadata.ts                # Next.js page metadata utilities
├── notifications/             # Notification helpers
├── permissions.ts             # Permission checking
├── prisma.ts                  # Prisma client setup (with Accelerate)
├── rate-limit.ts              # API rate limiting
├── requireAdmin.ts            # Admin route protection
├── seo-config.ts              # SEO configuration
├── utils/                     # Utility functions
│   └── phoneUtils.ts          # Phone number utilities
├── utils.ts                   # General utilities
└── validation/                # Input validation helpers
```

### Type Definitions (`/src/types`)
```
types/
├── index.ts                   # Central type exports
├── address.d.ts               # Address-related types
├── cart.d.ts                  # Cart types
├── config-forms.d.ts          # Config form types
├── config.d.ts                # Application config types
├── order.d.ts                 # Order and order item types
├── pos.d.ts                   # POS system types
├── product.d.ts               # Product and category types
├── promo.d.ts                 # Promo code types
└── user.d.ts                  # User-related types
```

### Constants (`/src/constants`)
```
constants/
├── contact.ts                 # Contact information constants
├── order.ts                   # Order-related constants
├── stores.ts                  # Store/location constants
└── userRole.ts                # User role definitions
```

### Database (`/prisma`)
```
prisma/
├── schema.prisma              # Database schema definition
├── seed-config.ts             # Config seed data
├── seed-pickup-location.ts    # Default pickup location config
├── migrations/                # Database migration files
│   ├── migration_lock.toml
│   ├── 20250704020219_init/
│   ├── 20250704020716_add_product_stock/
│   ├── 20250704034115_add_category_model/
│   ├── 20250705021043_add_full_name_to_user/
│   ├── 20250705024408_add_cart_models/
│   ├── 20250707030725_config_key_value_table/
│   ├── 20250708000000_add_feature_flag_table/
│   ├── 20250708075315_add_feature_flag_table/
│   ├── 20250708080745_add_user_role/
│   ├── 20250712221430_add_order_charges_fields/
│   ├── 20250713012142_add_is_deleted_to_address/
│   ├── 20250713052649_add_promocode_fields/
│   ├── 20250713065321_rename_surcharges_to_convenience_charges/
│   ├── 20250715234859_add_isdelete_columns/
│   ├── 20250716233544_add_contact_message_table/
│   ├── 20250718043448_add_order_type_payment_method/
│   ├── 20250720211249_add_order_number/
│   ├── 20250728060707_add_promo_code_extended_fields/
│   ├── 20250810212346_rename_order_type_to_delivery_type/
│   ├── 20251124035307_add_driver_role_and_order_assignment/
│   ├── 20260222042930_add_order_snapshot_fields/
│   ├── 20260222043724_/
│   └── 20260227023337_add_notifications/
└── seeds/                     # Database seeding scripts (archived)
    └── archive/               # Legacy seed scripts
```

### Scripts (`/scripts`)
```
scripts/
├── README.md                  # Scripts documentation
├── populate-db.js             # Test data population script
└── set-admin.js               # Firebase admin role assignment script
```

### Public Assets (`/public`)
```
public/
├── manifest.json              # PWA web app manifest
├── robots.txt                 # Search engine crawler rules
├── icon.svg                   # App icon (SVG)
├── icon-144x144.png           # App icon 144x144
├── icon-192x192.png           # App icon 192x192
├── icon-512x512.png           # App icon 512x512
├── logo-nalan2.jpg            # Nalan logo
├── logo-nalan2-192x192.jpg    # Nalan logo 192x192
├── logo-nalan2-512x512.jpg    # Nalan logo 512x512
├── hero1.jpg                  # Hero section image 1
├── hero2.jpg                  # Hero section image 2
├── hero3.jpg                  # Hero section image 3
├── ss0.png - ss6.png          # App screenshots
├── file.svg                   # File icon
├── globe.svg                  # Globe icon
├── next.svg                   # Next.js logo
├── vercel.svg                 # Vercel logo
└── window.svg                 # Window icon
```

## Database Schema

### Core Models
- **User**: Customer, admin, and driver accounts with phone-based authentication
- **Product**: Product catalog with categories, pricing, and inventory
- **Category**: Product categorization
- **Order**: Customer orders with items, pricing, status tracking, and driver assignments
- **OrderItem**: Individual items within orders with price snapshots
- **Cart**: Shopping cart functionality
- **CartItem**: Items in shopping carts
- **Address**: Customer delivery addresses
- **Config**: Application configuration settings
- **FeatureFlag**: Feature toggle management
- **ContactMessage**: Customer contact form submissions
- **Notification**: Admin push notification records

### Key Features
- **Soft Deletes**: Uses `isDelete` flags instead of hard deletes
- **Phone Standardization**: All phone numbers stored in +1XXXXXXXXXX format
- **Order Types**: Supports both DELIVERY and PICKUP orders (field: `deliveryType`)
- **Payment Methods**: Cash and card payment support
- **Role-Based Access**: USER, ADMIN, MANAGER, and DRIVER roles
- **Driver Integration**: Assign drivers to specific orders with dedicated relationship
- **Inventory Tracking**: Real-time stock management
- **Order Snapshots**: Price and product details stored at order time for historical accuracy

## Configuration Management

### Application Configuration
The application uses a flexible configuration system stored in the database:

- **Config Model**: Key-value pairs for application settings
- **Runtime Updates**: Configurations can be updated without deployment
- **Type Safety**: Configurations are type-checked and validated
- **Admin Interface**: Manage configurations through admin dashboard

### Charge Configuration
Control which charges are applied to orders:

```typescript
// Example configuration values
{
  "taxWaived": true,           // Waives tax for all orders
  "deliveryWaived": true,      // Waives delivery charges (also auto-waived for pickup)
  "convenienceWaived": true    // Waives convenience charges (also auto-waived for pickup)
}
```

### Order Type Behavior
- **PICKUP Orders**: Automatically waive delivery and convenience charges
- **DELIVERY Orders**: Apply charges based on configuration
- **Waived Charges**: Display with strikethrough and $0.00 in UI
- **Applied Charges**: Show normal styling with actual amounts

## Phone Number Standardization

All phone numbers are automatically standardized to the `+1XXXXXXXXXX` format:
- **Input Formats Supported**: 416-555-0200, (416) 555-0200, 4165550200, etc.
- **Prevents Duplicates**: Eliminates duplicate users with different phone formats
- **POS Integration**: Used for customer lookup and order management
- **Utilities**: Located in `/src/lib/utils/phoneUtils.ts`

## Authentication & Authorization

### Firebase Authentication
- **Admin SDK**: Server-side authentication for admin operations
- **Phone-based Auth**: OTP verification for user registration
- **Role Management**: USER, ADMIN, MANAGER, DRIVER role system
- **Session Management**: Secure session handling with middleware
- **FCM Support**: Firebase Cloud Messaging for push notifications

### Permission System
- **Route Protection**: Admin routes protected by middleware
- **Component-level**: Permission wrapper for UI elements
- **API Security**: All admin APIs require authentication
- **Role Checking**: Utilities in `/src/lib/permissions.ts`

## POS System Features

### Customer Management
- **Phone Lookup**: Find existing customers by phone number
- **Auto-standardization**: Phone numbers automatically formatted
- **Customer Creation**: New customers created on-the-fly
- **Order Linking**: All orders linked to customer accounts

### Order Processing
- **Product Selection**: Browse and add products to cart
- **Price Calculation**: Automatic tax and discount calculations
- **Payment Methods**: Cash and card payment support
- **Receipt Generation**: Printable receipt functionality
- **Stock Management**: Real-time inventory updates

### Features
- **Walk-in Customers**: Support for anonymous purchases
- **Customer History**: View previous orders and preferences
- **Real-time Updates**: Live inventory and pricing updates
- **Offline Capability**: Local storage for temporary data

## Type System

### Organized Type Structure
- **`/src/types/user.d.ts`**: User, UserResponse, PosCustomerData, etc.
- **`/src/types/product.d.ts`**: Product, Category, ProductResponse, etc.
- **`/src/types/order.d.ts`**: Order, OrderItem, OrderResponse, etc.
- **`/src/types/address.d.ts`**: Address, AddressResponse, etc.
- **`/src/types/pos.d.ts`**: POS-specific types and interfaces
- **`/src/types/cart.d.ts`**: Cart and CartItem types
- **`/src/types/config.d.ts`**: Application configuration types
- **`/src/types/config-forms.d.ts`**: Admin config form types
- **`/src/types/promo.d.ts`**: Promo code types
- **`/src/types/index.ts`**: Common types and central exports

### Benefits
- **Type Safety**: Strong typing throughout the application
- **API Contracts**: Clear interfaces for API requests/responses
- **Code Reusability**: Shared types across frontend and backend
- **Development Experience**: Better IntelliSense and error catching
- **Maintainability**: Centralized type definitions

## Environment Configuration

### Environment Files
- **`.env`**: Main local environment variables
- **`.env.example`**: Template with all required variables
- **`.env.production`**: Production environment settings
- **`.env.production.example`**: Production environment template
- **`.env.staging.example`**: Staging environment template
- **`.env.test.example`**: Test environment template

## Deployment

### GitHub Actions CI/CD
The project uses GitHub Actions (`.github/workflows/ci.yml`) for continuous integration and deployment:
- **Deploy Preview**: Automatically triggered on Pull Requests. Builds a temporary, isolated preview environment using Vercel and comments the URL on the PR for testing before merging.
- **Deploy Production**: Automatically triggered on pushes to the `main` branch. Deploys the finalized, optimized application to the live production environment.

### Vercel Deployment
- **Configuration**: `vercel.json` with environment-specific builds
- **Staging**: Automated staging deployment pipeline
- **Production**: Production deployment with optimizations

### Manual Deployment
```bash
# Build for production
npm run build

# Start production server
npm run start
```

## Development Guidelines

### Code Organization
- **Components**: Organized by feature and reusability
- **Services**: Business logic isolated in `/src/services` (separate from API routes)
- **API Routes**: RESTful structure with proper error handling
- **State Management**: Zustand stores for different data domains
- **Type Safety**: Comprehensive TypeScript coverage
- **Error Handling**: Consistent error patterns across the app

### Best Practices
- **Component Naming**: PascalCase for components, camelCase for utilities
- **File Structure**: Feature-based organization
- **Import Paths**: Use absolute imports with `@/` prefix
- **API Design**: RESTful endpoints with consistent response formats
- **Database**: Use Prisma for all database operations
- **Rate Limiting**: All public-facing endpoints should use rate limiting

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and ensure build passes (`npm run test:ci && npm run build:ci`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is proprietary and confidential.

## Support

For support and questions, please contact the development team.
