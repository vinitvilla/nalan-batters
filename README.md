# Nalan Batters

A comprehensive e-commerce web application built with Next.js, TypeScript, and Prisma ORM. Features modern UI, user authentication, product management, cart functionality, admin dashboard, and a complete Point-of-Sale (POS) system.

## Project Overview

Nalan Batters is a full-stack web application built with Next.js 15, TypeScript, and Prisma ORM. It features a modern UI, supports user authentication, product management, cart functionality, and comprehensive admin features including a POS system. The project uses Firebase for authentication and admin operations, and Prisma for database access and migrations.

### Key Features

- **Next.js App Router**: Uses the `/app` directory structure for routing
- **TypeScript**: Type-safe codebase with organized type definitions in `/src/types`
- **Prisma ORM**: Database schema and migrations managed in `/prisma`
- **Firebase Admin SDK**: For secure admin operations and authentication
- **Modern UI Components**: Located in `/src/components` and `/src/components/ui`
- **Cart & Checkout**: Cart state managed in `/src/store/cartStore.ts`, with checkout flow
- **Pickup & Delivery Orders**: Dual order types with conditional checkout flow and charge management
- **Admin Dashboard**: Complete admin interface with analytics and management
- **POS System**: Point-of-sale system with customer lookup and order management
- **Phone Number Standardization**: Automatic phone number formatting to +1XXXXXXXXXX format
- **User Authentication**: Phone-based user auth flow with OTP verification
- **Reusable Hooks**: Custom hooks for authentication, data fetching, and state management
- **API Routes**: Organized REST API under `/src/app/api`
- **Database Seeding**: Comprehensive seed scripts for initial data
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
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database
- `npm run migrate` - Run Prisma database migrations
- `npm run seed` - Seed database with initial data
- `npm run db:setup` - Run migrations and seed data

### Staging
- `npm run build:staging` - Build for staging environment
- `npm run start:staging` - Start staging server
- `npm run migrate:staging` - Run staging migrations
- `npm run seed:staging` - Seed staging database
- `npm run deploy:staging` - Deploy to staging environment

## Complete Project Structure

### Root Directory
```
├── .env                          # Environment variables (local)
├── .env.local                    # Next.js local environment
├── .env.local.staging           # Local staging environment
├── .env.production              # Production environment variables
├── .env.staging                 # Staging environment variables
├── .env.staging.example         # Example staging environment file
├── .gitignore                   # Git ignore rules
├── README.md                    # Project documentation
├── components.json              # shadcn/ui components configuration
├── eslint.config.mjs           # ESLint configuration
├── next-env.d.ts               # Next.js TypeScript definitions
├── next.config.ts              # Next.js configuration
├── package.json                # Project dependencies and scripts
├── package-lock.json           # Dependency lock file
├── postcss.config.mjs          # PostCSS configuration
├── tailwind.config.ts          # TailwindCSS configuration
├── tsconfig.json               # TypeScript configuration
└── vercel.json                 # Vercel deployment configuration
```

### Source Directory (`/src`)
```
src/
├── middleware.ts               # Next.js middleware (main)
├── middleware-admin.ts         # Admin-specific middleware
├── app/                       # Next.js App Router directory
├── components/                # React components
├── constants/                 # Application constants
├── generated/                 # Generated files (Prisma client)
├── hooks/                     # Custom React hooks
├── lib/                       # Utility libraries and functions
├── store/                     # State management (Zustand stores)
├── styles/                    # Additional styles
└── types/                     # TypeScript type definitions
```

### App Directory (`/src/app`)
```
app/
├── favicon.ico                # Application favicon
├── globals.css               # Global CSS styles
├── layout.tsx                # Root layout component
├── page.tsx                  # Home page component
├── admin/                    # Admin dashboard pages
├── api/                      # API routes
├── checkout/                 # Checkout flow pages
├── order-success/            # Order confirmation page
└── signin/                   # Authentication pages
```

### Admin Dashboard (`/src/app/admin`)
```
admin/
├── layout.tsx                # Admin layout with navigation
├── page.tsx                  # Admin dashboard home
├── use-admin-api.ts         # Admin API utilities
├── use-case-doc.js          # Documentation utilities
├── billing/                  # Billing and analytics pages
├── billing-pos/             # Point-of-sale system
├── components/              # Admin-specific components
├── contact-messages/        # Contact message management
├── dashboard/               # Main dashboard analytics
├── delivery/                # Delivery management
├── feature-flags/           # Feature flag management
├── orders/                  # Order management
├── pos-orders/              # POS order history
├── products/                # Product management
├── promo-codes/             # Promotional code management
├── settings/                # Admin settings
└── users/                   # User management
```

### API Routes (`/src/app/api`)
```
api/
├── admin/                   # Admin-only API endpoints
│   ├── billing/            # Billing analytics API
│   ├── categories/         # Category management API
│   ├── config/             # Configuration API
│   ├── contact-messages/   # Contact message API
│   ├── feature-flags/      # Feature flag API
│   ├── orders/             # Order management API
│   ├── pos/                # POS system API
│   ├── products/           # Product management API
│   ├── promoCodes/         # Promo code API
│   └── users/              # User management API
├── google-reviews/         # Google Reviews integration
└── public/                 # Public API endpoints
    ├── addresses/          # Address management
    ├── cart/               # Shopping cart API
    ├── config/             # Public configuration
    ├── contact/            # Contact form API
    ├── me/                 # User profile API
    ├── orders/             # Order placement API
    ├── products/           # Product catalog API
    ├── promoCodes/         # Promo code validation
    └── users/              # User registration/auth
```

### Components (`/src/components`)
```
components/
├── AddressForm.tsx          # Address input component
├── CartButton.tsx           # Shopping cart button
├── CartDropdown.tsx         # Cart dropdown menu
├── CartToast.tsx            # Cart notification toasts
├── CheckoutContactDelivery.tsx # Checkout delivery form
├── ChooseDeliveryDate.tsx   # Delivery date picker
├── ContactSection.tsx       # Contact information section
├── EnvironmentBadge.tsx     # Environment indicator
├── FeaturesSection.tsx      # Product features section
├── Footer.tsx               # Site footer
├── FreeDeliverySchedule.tsx # Delivery schedule display
├── GoldButton.tsx           # Styled button component
├── Header.tsx               # Site header
├── HeroSection.tsx          # Landing page hero
├── MainNav.tsx              # Main navigation
├── OpeningHours.tsx         # Business hours display
├── OrderSummary.tsx         # Order summary component
├── PermissionWrapper.tsx    # Role-based access control
├── ProductList.tsx          # Product listing component
├── QuickOrderSection.tsx    # Quick order interface
├── SessionHydrator.tsx      # Session state hydration
├── SimpleDeliveryMap.tsx    # Simple delivery locations map
├── TestimonialsSection.tsx  # Customer testimonials
├── UserDropdown.tsx         # User menu dropdown
├── UserLoginButton.tsx      # Login/logout button
├── admin/                   # Admin-specific components
├── auth/                    # Authentication components
└── ui/                      # Reusable UI components (shadcn/ui)
```

### State Management (`/src/store`)
```
store/
├── addressStore.ts          # Address management state
├── cartStore.ts             # Shopping cart state
├── configStore.ts           # Application configuration state
├── contactMessagesStore.ts  # Contact messages state
├── orderStore.ts            # Order management state
├── productStore.ts          # Product catalog state
└── userStore.ts             # User authentication state
```

### Custom Hooks (`/src/hooks`)
```
hooks/
├── use-mobile.ts            # Mobile device detection
├── useAdminAuth.ts          # Admin authentication hook
├── useBillingData.ts        # Billing data fetching
├── useNewMessagesCount.ts   # Message count tracking
├── usePosData.ts            # POS data management
└── useSignOut.ts            # User sign-out functionality
```

### Utilities (`/src/lib`)
```
lib/
├── firebase/                # Firebase integration
├── utils/                   # Utility functions
│   └── phoneUtils.ts       # Phone number utilities
├── hydrateUserFromApi.ts   # User data hydration
├── notifications.ts        # Notification utilities
├── permissions.ts          # Permission checking
├── prisma.ts              # Prisma client setup
├── requireAdmin.ts        # Admin route protection
└── utils.ts               # General utilities
```

### Type Definitions (`/src/types`)
```
types/
├── index.ts                # Central type exports
├── address.d.ts           # Address-related types
├── order.d.ts             # Order and order item types
├── pos.d.ts               # POS system types
├── product.d.ts           # Product and category types
└── user.d.ts              # User-related types
```

### Constants (`/src/constants`)
```
constants/
├── contact.ts             # Contact information constants
└── userRole.ts            # User role definitions
```

### Database (`/prisma`)
```
prisma/
├── schema.prisma          # Database schema definition
├── migrations/            # Database migration files
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
│   └── 20250718043448_add_order_type_payment_method/
└── seeds/                 # Database seeding scripts
    ├── category.js        # Category seed data
    ├── config.js          # Configuration seed data
    └── product.js         # Product seed data
```

### Scripts (`/scripts`)
```
scripts/
├── deploy-staging.sh      # Staging deployment automation
├── migrate-staging.sh     # Staging migration script
├── setup-staging-db.sh    # Staging database setup
└── start-staging.sh       # Staging server startup
```

### Public Assets (`/public`)
```
public/
├── file.svg              # File icon
├── globe.svg             # Globe icon
├── next.svg              # Next.js logo
├── vercel.svg            # Vercel logo
└── window.svg            # Window icon
```

## Database Schema

### Core Models
- **User**: Customer and admin accounts with phone-based authentication
- **Product**: Product catalog with categories, pricing, and inventory
- **Category**: Product categorization
- **Order**: Customer orders with items, pricing, and status tracking
- **OrderItem**: Individual items within orders
- **Cart**: Shopping cart functionality
- **CartItem**: Items in shopping carts
- **Address**: Customer delivery addresses
- **Config**: Application configuration settings
- **FeatureFlag**: Feature toggle management
- **ContactMessage**: Customer contact form submissions

### Key Features
- **Soft Deletes**: Uses `isDelete` flags instead of hard deletes
- **Phone Standardization**: All phone numbers stored in +1XXXXXXXXXX format
- **Order Types**: Supports both DELIVERY and PICKUP orders
- **Payment Methods**: Cash and card payment support
- **Role-Based Access**: USER, ADMIN, and MANAGER roles
- **Inventory Tracking**: Real-time stock management

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

For detailed information about pickup and delivery features, see [PICKUP_DELIVERY_GUIDE.md](./PICKUP_DELIVERY_GUIDE.md).

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
- **Role Management**: USER, ADMIN, MANAGER role system
- **Session Management**: Secure session handling with middleware

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
- **`/src/types/index.ts`**: Common types and central exports

### Benefits
- **Type Safety**: Strong typing throughout the application
- **API Contracts**: Clear interfaces for API requests/responses
- **Code Reusability**: Shared types across frontend and backend
- **Development Experience**: Better IntelliSense and error catching
- **Maintainability**: Centralized type definitions

## Environment Configuration

### Environment Files
- **`.env`**: Main environment variables
- **`.env.local`**: Local development overrides
- **`.env.staging`**: Staging environment configuration
- **`.env.production`**: Production environment settings

### Required Variables
```
DATABASE_URL=postgresql://...
FIREBASE_ADMIN_SDK_PATH=./path/to/firebase-key.json
NEXT_PUBLIC_APP_ENV=development|staging|production
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## Deployment

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

# Or deploy to staging
npm run deploy:staging
```

## Development Guidelines

### Code Organization
- **Components**: Organized by feature and reusability
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

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and ensure build passes (`npm run build`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is proprietary and confidential.

## Support

For support and questions, please contact the development team.
