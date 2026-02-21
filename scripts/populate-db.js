import { PrismaClient } from '../src/generated/prisma/index.js';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Set faker locale for consistent Canadian data
faker.locale = 'en_CA';

// ===== VALIDATION HELPERS =====

/**
 * Validates configuration values for reasonable limits
 * @throws {Error} If configuration values are invalid
 */
function validateConfiguration() {
  if (CONFIG.USERS_COUNT < 1 || CONFIG.USERS_COUNT > 10000) {
    throw new Error('USERS_COUNT must be between 1 and 10000');
  }
  if (CONFIG.DAYS_TO_SIMULATE < 1 || CONFIG.DAYS_TO_SIMULATE > 365) {
    throw new Error('DAYS_TO_SIMULATE must be between 1 and 365');
  }
  if (CONFIG.ORDERS_PER_DAY_MIN > CONFIG.ORDERS_PER_DAY_MAX) {
    throw new Error('ORDERS_PER_DAY_MIN cannot be greater than ORDERS_PER_DAY_MAX');
  }
  if (CONFIG.USER_ORDER_PROBABILITY < 0 || CONFIG.USER_ORDER_PROBABILITY > 1) {
    throw new Error('USER_ORDER_PROBABILITY must be between 0 and 1');
  }
  if (CONFIG.MAX_ADDRESSES_PER_USER < 1 || CONFIG.MAX_ADDRESSES_PER_USER > 5) {
    throw new Error('MAX_ADDRESSES_PER_USER must be between 1 and 5');
  }
}

// ===== CONFIGURATION =====

/**
 * Main configuration object for database population
 * Adjust these values to control the amount of test data generated
 */
const CONFIG = {
  /** Whether to generate mock test data (users, orders, etc.) */
  GENERATE_MOCK_DATA: false,

  /** Number of mock users to create (1-10000) */
  USERS_COUNT: 50,
  /** Minimum orders per day for online orders (realistic range) */
  ORDERS_PER_DAY_MIN: 15,
  /** Maximum orders per day for online orders (realistic range) */
  ORDERS_PER_DAY_MAX: 20,
  /** Minimum POS orders per day (store pickup orders) */
  POS_ORDERS_PER_DAY_MIN: 30,
  /** Maximum POS orders per day (store pickup orders) */
  POS_ORDERS_PER_DAY_MAX: 40,
  /** Number of days to simulate historical data (1-365) */
  DAYS_TO_SIMULATE: 30, // 30 days of historical data
  /** Maximum addresses per user (increased for better distribution) */
  MAX_ADDRESSES_PER_USER: 1,
  /** Probability that a user will order on any given day (0-1) */
  USER_ORDER_PROBABILITY: 0.1, // 10% chance per user per day
};

// ===== MOCK DATA CONSTANTS =====

/**
 * Mock product data for testing
 * These represent sample products for development/testing
 */
const MOCK_PRODUCT_DATA = [
  {
    name: "1.5L Dosa Batter",
    description: "Fresh 1.5L dosa batter made with premium ingredients.",
    price: 10,
    stock: 100,
  },
  {
    name: "2.5L Dosa Batter",
    description: "Fresh 2.5L dosa batter perfect for families.",
    price: 15,
    stock: 100,
  },
  {
    name: "5L Dosa Batter",
    description: "Fresh 5L dosa batter ideal for large gatherings.",
    price: 28,
    stock: 100,
  },
  {
    name: "Idli Mix 500g",
    description: "Ready to use idli mix - 500g pack, just add water.",
    price: 8,
    stock: 100,
  },
  {
    name: "Vada Mix 400g",
    description: "Instant vada mix - just add water and fry for crispy vadas.",
    price: 6,
    stock: 100,
  },
  {
    name: "Uttapam Batter 1L",
    description: "Fresh uttapam batter for making crispy uttapams.",
    price: 12,
    stock: 100,
  },
];

/**
 * Mock promo code data for testing
 * Includes various discount types and conditions for development/testing
 */
const MOCK_PROMO_CODE_DATA = [
  {
    code: 'WELCOME10',
    discount: 10.00,
    discountType: 'PERCENTAGE',
    description: 'Welcome discount - 10% off your first order',
    minOrderAmount: 25.00,
    maxDiscount: 15.00,
    usageLimit: 100,
    expiresAt: 30, // days from now
  },
  {
    code: 'SAVE5',
    discount: 5.00,
    discountType: 'VALUE',
    description: 'Get $5 off your order',
    minOrderAmount: 30.00,
    maxDiscount: 5.00,
    usageLimit: 200,
    expiresAt: 60,
  },
  {
    code: 'BIGORDER',
    discount: 15.00,
    discountType: 'PERCENTAGE',
    description: 'Big order discount - 15% off orders over $75',
    minOrderAmount: 75.00,
    maxDiscount: 25.00,
    usageLimit: 50,
    expiresAt: 45,
  },
  {
    code: 'FIRSTORDER',
    discount: 3.00,
    discountType: 'VALUE',
    description: 'First order discount - $3 off',
    minOrderAmount: 20.00,
    maxDiscount: 3.00,
    usageLimit: 500,
    expiresAt: 90,
  },
  {
    code: 'BULK20',
    discount: 20.00,
    discountType: 'PERCENTAGE',
    description: 'Bulk order special - 20% off orders over $100',
    minOrderAmount: 100.00,
    maxDiscount: 40.00,
    usageLimit: 25,
    expiresAt: 15,
  },
  {
    code: 'WEEKEND15',
    discount: 15.00,
    discountType: 'PERCENTAGE',
    description: 'Weekend special - 15% off',
    minOrderAmount: 40.00,
    maxDiscount: 20.00,
    usageLimit: 75,
    expiresAt: 7,
  },
  {
    code: 'FLAT10',
    discount: 10.00,
    discountType: 'VALUE',
    description: 'Flat $10 off your order',
    minOrderAmount: 50.00,
    maxDiscount: 10.00,
    usageLimit: 150,
    expiresAt: 30,
  },
  {
    code: 'EXPIRED50',
    discount: 50.00,
    discountType: 'PERCENTAGE',
    description: 'Expired promo - 50% off (for testing)',
    minOrderAmount: 10.00,
    maxDiscount: 100.00,
    usageLimit: 10,
    isActive: false,
    expiresAt: -5, // expired 5 days ago
  }
];

/**
 * Mock distribution patterns for generating realistic test orders
 * Based on typical e-commerce and food delivery business patterns
 */
const MOCK_DISTRIBUTIONS = {
  /** Order status distribution (percentage weights) */
  ORDER_STATUS: {
    DELIVERED: 60,    // Most orders are completed
    CONFIRMED: 15,    // Some orders in progress
    SHIPPED: 10,      // Some orders shipped
    PENDING: 10,      // Some pending orders
    CANCELLED: 5,     // Small percentage cancelled
  },
  /** Delivery type distribution */
  DELIVERY_TYPE: {
    DELIVERY: 70,     // Most customers prefer delivery
    PICKUP: 30,       // Some customers prefer pickup
  },
  /** Payment method distribution for online orders */
  PAYMENT_METHOD: {
    ONLINE: 75,       // Most online payments
    CASH: 25,         // Some cash on delivery
  },
  /** Payment method distribution for POS orders */
  POS_PAYMENT: {
    CASH: 60,         // More cash payments in store
    CARD: 40,         // Some card payments
  },
};

/**
 * Mock time-based order patterns to simulate realistic test data
 * Higher numbers indicate more orders during that time period
 */
const MOCK_TIME_PATTERNS = {
  /** Hourly order distribution (0-23 hours) */
  HOURLY: {
    0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 2,           // Late night/early morning - very low
    6: 3, 7: 5, 8: 8,                              // Morning rush starting
    9: 12, 10: 15, 11: 18,                         // Morning peak
    12: 20, 13: 18, 14: 15,                        // Lunch peak
    15: 12, 16: 10, 17: 8,                         // Afternoon decline
    18: 15, 19: 18, 20: 12,                        // Evening dinner rush
    21: 8, 22: 5, 23: 3,                           // Evening wind down
  },
  /** POS hourly distribution (business hours only) */
  POS_HOURLY: {
    0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0,           // Closed overnight
    6: 1, 7: 2, 8: 5,                              // Opening hours
    9: 8, 10: 12, 11: 15,                          // Morning customers
    12: 18, 13: 20, 14: 15,                        // Lunch rush
    15: 12, 16: 10, 17: 8,                         // Afternoon
    18: 15, 19: 18, 20: 12,                        // Evening
    21: 8, 22: 3, 23: 1,                           // Closing time
  },
  /** Daily order distribution (0=Sunday, 6=Saturday) */
  DAILY: {
    0: 15,            // Sunday - moderate
    1: 8,             // Monday - low
    2: 10,            // Tuesday - low-moderate
    3: 12,            // Wednesday - moderate
    4: 14,            // Thursday - moderate-high
    5: 18,            // Friday - high
    6: 20,            // Saturday - highest
  },
};

// ===== UTILITY FUNCTIONS =====

/**
 * Returns a weighted random selection from an object of weights
 * @param {Object} weights - Object with keys and their corresponding weights
 * @returns {string} Selected key based on weighted probability
 */
function getWeightedRandom(weights) {
  const items = Object.keys(weights);
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);

  if (totalWeight === 0) {
    return items[Math.floor(Math.random() * items.length)];
  }

  const random = Math.random() * totalWeight;
  let weightSum = 0;

  for (const item of items) {
    weightSum += weights[item];
    if (random <= weightSum) {
      return item;
    }
  }

  return items[items.length - 1];
}

/**
 * Generates a realistic Canadian phone number with proper area codes
 * @returns {string} Formatted phone number (+1XXXXXXXXXX)
 */
function generateCanadianPhoneNumber() {
  // Common Canadian area codes, focused on Ontario
  const areaCodes = [
    '416', '647', '437',  // Toronto
    '905', '289', '365',  // Greater Toronto Area
    '226', '519',         // Southwestern Ontario
    '613', '343',         // Eastern Ontario
    '705', '249'          // Northern Ontario
  ];

  const areaCode = faker.helpers.arrayElement(areaCodes);
  const exchange = faker.string.numeric(3, { leadingZeros: false, bannedDigits: ['0', '1'] });
  const number = faker.string.numeric(4);

  return `+1${areaCode}${exchange}${number}`;
}

/**
 * Generates a unique 5-character alphanumeric order number for POS orders
 * Uses format: P#### where #### are random alphanumeric characters
 * @returns {string} 5-character order number (e.g., "P1A2B")
 */
function generatePosOrderNumber() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let orderNumber = 'P';
  for (let i = 0; i < 4; i++) {
    orderNumber += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return orderNumber;
}

/**
 * Generates a unique order number for POS orders, checking against database
 * @returns {Promise<string>} Unique 5-character order number
 */
async function generateUniquePosOrderNumber() {
  let attempts = 0;
  let orderNumber;

  do {
    orderNumber = generatePosOrderNumber();
    const existing = await prisma.order.findFirst({
      where: { orderNumber },
      select: { id: true }
    });

    if (!existing) {
      return orderNumber;
    }

    attempts++;
  } while (attempts < 50);

  throw new Error('Failed to generate unique POS order number after 50 attempts');
}

/**
 * Rounds a number to 2 decimal places for currency calculations
 * @param {number} amount - The amount to round
 * @returns {number} Rounded amount
 */
function roundCurrency(amount) {
  return Math.round(amount * 100) / 100;
}

/**
 * Calculates HST (13%) on a given amount
 * @param {number} amount - The pre-tax amount
 * @returns {number} Tax amount rounded to 2 decimal places
 */
function calculateHST(amount) {
  return roundCurrency(amount * 0.13);
}

/**
 * Logs database statistics after population
 * @returns {Promise<void>}
 */
async function logDatabaseStatistics() {
  try {
    console.log('\n📊 Database Statistics:');

    const stats = await Promise.all([
      prisma.user.count(),
      prisma.address.count(),
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.count(),
      prisma.orderItem.count(),
      prisma.promoCode.count(),
      prisma.order.count({ where: { deliveryType: 'DELIVERY' } }),
      prisma.order.count({ where: { deliveryType: 'PICKUP' } }),
      prisma.order.count({ where: { orderType: 'POS' } }),
    ]);

    const [users, addresses, products, categories, orders, orderItems, promoCodes, deliveryOrders, pickupOrders, posOrders] = stats;

    console.log(`   👥 Users: ${users}`);
    console.log(`   🏠 Addresses: ${addresses}`);
    console.log(`   📦 Products: ${products}`);
    console.log(`   📁 Categories: ${categories}`);
    console.log(`   📋 Orders: ${orders}`);
    console.log(`   📦 Delivery Orders: ${deliveryOrders}`);
    console.log(`   🏪 Pickup Orders: ${pickupOrders}`);
    console.log(`   🔢 POS Orders: ${posOrders}`);
    console.log(`   📄 Order Items: ${orderItems}`);
    console.log(`   🎫 Promo Codes: ${promoCodes}`);

  } catch (error) {
    console.warn('⚠️  Could not fetch database statistics:', error.message);
  }
}

/**
 * Generates a real address from the Greater Toronto Area
 * Includes: Toronto, Scarborough, Mississauga, Brampton, Markham, North York, Ajax, Pickering, Whitby, Oshawa, Etobicoke
 * @returns {Object} - Address object with real GTA data
 */
function generateRealGTAAddress() {
  const gtaAddresses = [
    // Toronto Downtown
    { street: '100 King St W', unit: Math.random() > 0.7 ? `Unit ${Math.floor(Math.random() * 1000) + 100}` : null, city: 'Toronto', postal: 'M5X 1C9' },
    { street: '1 Yonge St', unit: null, city: 'Toronto', postal: 'M5E 1W7' },
    { street: '200 Bay St', unit: Math.random() > 0.5 ? `Suite ${Math.floor(Math.random() * 500) + 100}` : null, city: 'Toronto', postal: 'M5J 2J1' },
    { street: '88 Queens Quay W', unit: Math.random() > 0.6 ? `Unit ${Math.floor(Math.random() * 300) + 100}` : null, city: 'Toronto', postal: 'M5J 0B8' },
    { street: '123 Front St W', unit: Math.random() > 0.8 ? `Apt ${Math.floor(Math.random() * 50) + 1}` : null, city: 'Toronto', postal: 'M5J 2M2' },
    { street: '250 Dundas St W', unit: Math.random() > 0.7 ? `Unit ${Math.floor(Math.random() * 400) + 100}` : null, city: 'Toronto', postal: 'M5T 2Z5' },
    { street: '33 Harbour Sq', unit: Math.random() > 0.5 ? `Apt ${Math.floor(Math.random() * 600) + 100}` : null, city: 'Toronto', postal: 'M5J 2G2' },
    { street: '500 University Ave', unit: null, city: 'Toronto', postal: 'M5G 1V7' },
    { street: '777 Bay St', unit: Math.random() > 0.6 ? `Suite ${Math.floor(Math.random() * 200) + 10}` : null, city: 'Toronto', postal: 'M5G 2C8' },
    { street: '299 Queen St W', unit: null, city: 'Toronto', postal: 'M5V 2Z5' },

    // North York
    { street: '5000 Yonge St', unit: Math.random() > 0.5 ? `Unit ${Math.floor(Math.random() * 200) + 1}` : null, city: 'North York', postal: 'M2N 7E9' },
    { street: '4700 Keele St', unit: null, city: 'North York', postal: 'M3J 1P3' },
    { street: '1200 Sheppard Ave E', unit: Math.random() > 0.7 ? `Suite ${Math.floor(Math.random() * 100) + 10}` : null, city: 'North York', postal: 'M2K 2S5' },
    { street: '3401 Dufferin St', unit: Math.random() > 0.6 ? `Unit ${Math.floor(Math.random() * 150) + 1}` : null, city: 'North York', postal: 'M6A 2T9' },
    { street: '2200 Finch Ave W', unit: null, city: 'North York', postal: 'M3N 2V7' },
    { street: '1500 Don Mills Rd', unit: Math.random() > 0.6 ? `Suite ${Math.floor(Math.random() * 200) + 10}` : null, city: 'North York', postal: 'M3B 3K4' },
    { street: '35 Finch Ave E', unit: Math.random() > 0.5 ? `Apt ${Math.floor(Math.random() * 300) + 100}` : null, city: 'North York', postal: 'M2N 6Z8' },
    { street: '5650 Yonge St', unit: null, city: 'North York', postal: 'M2M 4G3' },
    { street: '1800 Sheppard Ave E', unit: Math.random() > 0.7 ? `Unit ${Math.floor(Math.random() * 100) + 1}` : null, city: 'North York', postal: 'M2J 5A7' },
    { street: '1010 Wilson Ave', unit: null, city: 'North York', postal: 'M3K 1G6' },

    // Scarborough
    { street: '300 Borough Dr', unit: Math.random() > 0.5 ? `Apt ${Math.floor(Math.random() * 800) + 100}` : null, city: 'Scarborough', postal: 'M1P 4P5' },
    { street: '4700 Lawrence Ave E', unit: null, city: 'Scarborough', postal: 'M1E 2V2' },
    { street: '1911 Kennedy Rd', unit: Math.random() > 0.7 ? `Unit ${Math.floor(Math.random() * 50) + 1}` : null, city: 'Scarborough', postal: 'M1P 2L9' },
    { street: '200 Town Centre Crt', unit: Math.random() > 0.6 ? `Suite ${Math.floor(Math.random() * 300) + 100}` : null, city: 'Scarborough', postal: 'M1P 4X4' },
    { street: '2623 Eglinton Ave E', unit: 'Unit 1', city: 'Scarborough', postal: 'M1K 2S2' },
    { street: '1050 Markham Rd', unit: Math.random() > 0.5 ? `Apt ${Math.floor(Math.random() * 500) + 100}` : null, city: 'Scarborough', postal: 'M1H 2Y7' },
    { street: '3415 Kingston Rd', unit: Math.random() > 0.7 ? `Unit ${Math.floor(Math.random() * 100) + 1}` : null, city: 'Scarborough', postal: 'M1M 1R4' },
    { street: '1750 Brimley Rd', unit: null, city: 'Scarborough', postal: 'M1P 0C8' },
    { street: '2900 Warden Ave', unit: Math.random() > 0.6 ? `Unit ${Math.floor(Math.random() * 150) + 1}` : null, city: 'Scarborough', postal: 'M1W 2S8' },
    { street: '2555 Victoria Park Ave', unit: null, city: 'Scarborough', postal: 'M1T 1A3' },

    // Mississauga
    { street: '100 City Centre Dr', unit: Math.random() > 0.8 ? `Unit ${Math.floor(Math.random() * 200) + 1}` : null, city: 'Mississauga', postal: 'L5B 2C9' },
    { street: '6800 Kitimat Rd', unit: null, city: 'Mississauga', postal: 'L5N 5L9' },
    { street: '3050 Confederation Pkwy', unit: Math.random() > 0.5 ? `Suite ${Math.floor(Math.random() * 150) + 10}` : null, city: 'Mississauga', postal: 'L5B 3Z9' },
    { street: '2151 Leanne Blvd', unit: Math.random() > 0.7 ? `Unit ${Math.floor(Math.random() * 100) + 1}` : null, city: 'Mississauga', postal: 'L5K 2L5' },
    { street: '4141 Dixie Rd', unit: null, city: 'Mississauga', postal: 'L4W 1V5' },
    { street: '3000 Mavis Rd', unit: Math.random() > 0.6 ? `Apt ${Math.floor(Math.random() * 400) + 100}` : null, city: 'Mississauga', postal: 'L5C 1T7' },
    { street: '4275 Hurontario St', unit: Math.random() > 0.5 ? `Suite ${Math.floor(Math.random() * 200) + 10}` : null, city: 'Mississauga', postal: 'L4Z 0A3' },
    { street: '1700 Dundas St W', unit: null, city: 'Mississauga', postal: 'L5C 1E3' },
    { street: '5100 Erin Mills Pkwy', unit: Math.random() > 0.7 ? `Unit ${Math.floor(Math.random() * 100) + 1}` : null, city: 'Mississauga', postal: 'L5M 4Z5' },
    { street: '2085 Winston Park Dr', unit: null, city: 'Mississauga', postal: 'L5K 2T1' },

    // Brampton
    { street: '2 County Ct Blvd', unit: Math.random() > 0.6 ? `Suite ${Math.floor(Math.random() * 200) + 100}` : null, city: 'Brampton', postal: 'L6W 3W8' },
    { street: '25 Peel Centre Dr', unit: Math.random() > 0.5 ? `Unit ${Math.floor(Math.random() * 50) + 1}` : null, city: 'Brampton', postal: 'L6T 3R5' },
    { street: '50 Gillingham Dr', unit: null, city: 'Brampton', postal: 'L6X 5A5' },
    { street: '9025 Torbram Rd', unit: Math.random() > 0.7 ? `Unit ${Math.floor(Math.random() * 75) + 1}` : null, city: 'Brampton', postal: 'L6S 6H3' },
    { street: '7700 Hurontario St', unit: Math.random() > 0.8 ? `Apt ${Math.floor(Math.random() * 300) + 100}` : null, city: 'Brampton', postal: 'L6Y 4M3' },
    { street: '295 Queen St E', unit: Math.random() > 0.6 ? `Unit ${Math.floor(Math.random() * 150) + 1}` : null, city: 'Brampton', postal: 'L6W 4S6' },
    { street: '100 Main St N', unit: null, city: 'Brampton', postal: 'L6V 1N8' },
    { street: '50 Kennedy Rd S', unit: Math.random() > 0.5 ? `Suite ${Math.floor(Math.random() * 100) + 10}` : null, city: 'Brampton', postal: 'L6W 3R7' },
    { street: '85 Steeles Ave W', unit: Math.random() > 0.7 ? `Unit ${Math.floor(Math.random() * 75) + 1}` : null, city: 'Brampton', postal: 'L6Y 0B5' },
    { street: '2500 Williams Pkwy', unit: null, city: 'Brampton', postal: 'L6S 5M9' },

    // Markham
    { street: '4800 Highway 7', unit: Math.random() > 0.5 ? `Unit ${Math.floor(Math.random() * 150) + 1}` : null, city: 'Markham', postal: 'L3R 1M2' },
    { street: '3601 Highway 7 E', unit: null, city: 'Markham', postal: 'L3R 0M3' },
    { street: '9350 Yonge St', unit: Math.random() > 0.6 ? `Suite ${Math.floor(Math.random() * 100) + 10}` : null, city: 'Markham', postal: 'L4C 5G2' },
    { street: '14 Cornerstone Dr', unit: Math.random() > 0.7 ? `Unit ${Math.floor(Math.random() * 50) + 1}` : null, city: 'Markham', postal: 'L3P 7N8' },
    { street: '5762 Highway 7', unit: null, city: 'Markham', postal: 'L3P 1A8' },
    { street: '8601 Warden Ave', unit: Math.random() > 0.5 ? `Apt ${Math.floor(Math.random() * 300) + 100}` : null, city: 'Markham', postal: 'L3R 0B5' },
    { street: '3080 Kennedy Rd', unit: Math.random() > 0.7 ? `Unit ${Math.floor(Math.random() * 75) + 1}` : null, city: 'Markham', postal: 'L3R 2B7' },
    { street: '7181 Yonge St', unit: null, city: 'Markham', postal: 'L3T 0C7' },
    { street: '4300 Steeles Ave E', unit: Math.random() > 0.6 ? `Unit ${Math.floor(Math.random() * 150) + 1}` : null, city: 'Markham', postal: 'L3R 0Y5' },
    { street: '3000 Highway 7 E', unit: null, city: 'Markham', postal: 'L3R 6E1' },

    // Ajax
    { street: '75 Bayly St W', unit: Math.random() > 0.5 ? `Unit ${Math.floor(Math.random() * 100) + 1}` : null, city: 'Ajax', postal: 'L1S 7K7' },
    { street: '1166 Harwood Ave N', unit: null, city: 'Ajax', postal: 'L1T 0B6' },
    { street: '50 Westney Rd N', unit: Math.random() > 0.6 ? `Suite ${Math.floor(Math.random() * 75) + 10}` : null, city: 'Ajax', postal: 'L1T 1P6' },
    { street: '280 Kingston Rd', unit: Math.random() > 0.7 ? `Unit ${Math.floor(Math.random() * 50) + 1}` : null, city: 'Ajax', postal: 'L1S 7J9' },
    { street: '15 Westney Rd N', unit: null, city: 'Ajax', postal: 'L1T 3V2' },
    { street: '1901 Harwood Ave N', unit: Math.random() > 0.5 ? `Apt ${Math.floor(Math.random() * 200) + 100}` : null, city: 'Ajax', postal: 'L1Z 0B8' },
    { street: '600 Monarch Ave', unit: Math.random() > 0.7 ? `Unit ${Math.floor(Math.random() * 100) + 1}` : null, city: 'Ajax', postal: 'L1S 6M1' },
    { street: '1955 Bayly St', unit: null, city: 'Ajax', postal: 'L1S 3M7' },

    // Pickering
    { street: '1355 Kingston Rd', unit: Math.random() > 0.7 ? `Unit ${Math.floor(Math.random() * 50) + 1}` : null, city: 'Pickering', postal: 'L1V 1B8' },
    { street: '1899 Brock Rd', unit: null, city: 'Pickering', postal: 'L1V 2P8' },
    { street: '533 Kingston Rd', unit: Math.random() > 0.5 ? `Suite ${Math.floor(Math.random() * 100) + 10}` : null, city: 'Pickering', postal: 'L1V 2R1' },
    { street: '1792 Liverpool Rd', unit: Math.random() > 0.6 ? `Unit ${Math.floor(Math.random() * 75) + 1}` : null, city: 'Pickering', postal: 'L1V 1V9' },
    { street: '1101 Finch Ave', unit: null, city: 'Pickering', postal: 'L1V 0B6' },
    { street: '650 Kingston Rd', unit: Math.random() > 0.5 ? `Apt ${Math.floor(Math.random() * 150) + 100}` : null, city: 'Pickering', postal: 'L1V 3N7' },
    { street: '850 Whites Rd', unit: Math.random() > 0.7 ? `Unit ${Math.floor(Math.random() * 100) + 1}` : null, city: 'Pickering', postal: 'L1V 0A2' },
    { street: '1755 Pickering Pkwy', unit: null, city: 'Pickering', postal: 'L1V 6K5' },

    // Whitby
    { street: '75 Consumers Dr', unit: Math.random() > 0.6 ? `Unit ${Math.floor(Math.random() * 150) + 1}` : null, city: 'Whitby', postal: 'L1N 9S2' },
    { street: '1615 Dundas St E', unit: null, city: 'Whitby', postal: 'L1N 1C4' },
    { street: '209 Dundas St W', unit: Math.random() > 0.5 ? `Suite ${Math.floor(Math.random() * 75) + 10}` : null, city: 'Whitby', postal: 'L1N 2M2' },
    { street: '3000 Garden St', unit: Math.random() > 0.7 ? `Unit ${Math.floor(Math.random() * 100) + 1}` : null, city: 'Whitby', postal: 'L1R 2G6' },
    { street: '701 Rossland Rd E', unit: null, city: 'Whitby', postal: 'L1N 8Y9' },
    { street: '1111 Brock St S', unit: Math.random() > 0.5 ? `Apt ${Math.floor(Math.random() * 200) + 100}` : null, city: 'Whitby', postal: 'L1N 4M1' },
    { street: '4100 Baldwin St S', unit: Math.random() > 0.6 ? `Unit ${Math.floor(Math.random() * 75) + 1}` : null, city: 'Whitby', postal: 'L1R 2W6' },
    { street: '900 Thickson Rd S', unit: null, city: 'Whitby', postal: 'L1N 0A4' },

    // Oshawa
    { street: '419 King St W', unit: Math.random() > 0.7 ? `Unit ${Math.floor(Math.random() * 100) + 1}` : null, city: 'Oshawa', postal: 'L1J 2K5' },
    { street: '1300 Stevenson Rd N', unit: null, city: 'Oshawa', postal: 'L1J 5P5' },
    { street: '240 Taunton Rd E', unit: Math.random() > 0.5 ? `Suite ${Math.floor(Math.random() * 50) + 10}` : null, city: 'Oshawa', postal: 'L1G 3V2' },
    { street: '580 Laval Dr', unit: Math.random() > 0.6 ? `Unit ${Math.floor(Math.random() * 75) + 1}` : null, city: 'Oshawa', postal: 'L1J 0B5' },
    { street: '200 Bond St W', unit: null, city: 'Oshawa', postal: 'L1J 2L7' },
    { street: '1389 Harmony Rd N', unit: Math.random() > 0.5 ? `Apt ${Math.floor(Math.random() * 150) + 100}` : null, city: 'Oshawa', postal: 'L1H 7K5' },
    { street: '1050 Simcoe St N', unit: Math.random() > 0.7 ? `Unit ${Math.floor(Math.random() * 100) + 1}` : null, city: 'Oshawa', postal: 'L1G 4W4' },
    { street: '600 Grandview St S', unit: null, city: 'Oshawa', postal: 'L1H 8P4' },

    // Etobicoke
    { street: '25 The West Mall', unit: Math.random() > 0.6 ? `Unit ${Math.floor(Math.random() * 200) + 1}` : null, city: 'Etobicoke', postal: 'M9C 1B8' },
    { street: '900 The Queensway', unit: null, city: 'Etobicoke', postal: 'M8Z 1N5' },
    { street: '1500 Royal York Rd', unit: Math.random() > 0.5 ? `Suite ${Math.floor(Math.random() * 100) + 10}` : null, city: 'Etobicoke', postal: 'M9P 3B4' },
    { street: '380 The Westway', unit: Math.random() > 0.7 ? `Unit ${Math.floor(Math.random() * 100) + 1}` : null, city: 'Etobicoke', postal: 'M9R 1H4' },
    { street: '2500 Bloor St W', unit: null, city: 'Etobicoke', postal: 'M8X 2X5' },
    { street: '3300 Lakeshore Blvd W', unit: Math.random() > 0.5 ? `Apt ${Math.floor(Math.random() * 300) + 100}` : null, city: 'Etobicoke', postal: 'M8V 1M4' },
    { street: '5400 Dixie Rd', unit: Math.random() > 0.6 ? `Unit ${Math.floor(Math.random() * 150) + 1}` : null, city: 'Etobicoke', postal: 'M9B 1A7' },
    { street: '1000 Islington Ave', unit: null, city: 'Etobicoke', postal: 'M8Z 4P8' },
  ];

  // Randomly select an address from the array
  const randomIndex = Math.floor(Math.random() * gtaAddresses.length);
  const address = gtaAddresses[randomIndex];

  // Format the address
  return {
    street: address.street,
    unit: address.unit,
    city: address.city,
    province: 'ON',
    country: 'Canada',
    postal: address.postal,
    // fullAddress: address.unit 
    //   ? `${address.unit}, ${address.street}, ${address.city}, ON ${address.postal}`
    //   : `${address.street}, ${address.city}, ON ${address.postal}`
  };
}

// ===== ESSENTIAL SYSTEM DATA FUNCTIONS =====

/**
 * Completely clears all data except config and Firebase admin users
 * NOTE: This is a destructive operation used for fresh database setup
 */
async function truncateAllData() {
  console.log('🗑️  Completely clearing all data for fresh start...');

  try {
    // Delete in correct order to avoid foreign key constraints
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();

    // Delete all addresses
    await prisma.address.deleteMany();

    // Delete all users except Firebase admin users that might exist
    const firebaseAdmins = await prisma.user.findMany({
      where: {
        role: 'ADMIN',
        phone: { not: 'system-pickup' }
      }
    });

    await prisma.user.deleteMany({
      where: {
        id: { notIn: firebaseAdmins.map(admin => admin.id) }
      }
    });

    // Delete promo codes
    await prisma.promoCode.deleteMany();

    // Delete products and categories
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();

    console.log('✅ All data cleared successfully (preserved Firebase admin users and config)');
  } catch (error) {
    console.error('❌ Error truncating data:', error);
    throw error;
  }
}

// ===== MOCK DATA CREATION FUNCTIONS =====

/**
 * Creates the main product category (Dosa Batter)
 * @returns {Object} - Created category object
 */
async function createMockCategories() {
  console.log('📁 Creating categories...');

  const category = await prisma.category.upsert({
    where: { name: "Dosa Batter" },
    update: {},
    create: { name: "Dosa Batter" },
  });

  console.log('✅ Categories created');
  return category;
}

/**
 * Creates the main products (different sizes of dosa batter)
 * @param {Object} category - Category object to associate products with
 */
async function createMockProducts(category) {
  console.log('📦 Creating products...');

  const productsData = MOCK_PRODUCT_DATA.map(product => ({
    ...product,
    imageUrl: "",
    isActive: true,
    categoryId: category.id,
  }));

  await prisma.product.createMany({
    data: productsData,
    skipDuplicates: true,
  });

  console.log('✅ Products created');
}

/**
 * Creates system user and default pickup address (ESSENTIAL)
 * This is required for the application to function properly
 * @returns {Object} - System user and pickup address objects
 */
async function createSystemUserAndAddresses() {
  console.log('🏠 Creating system user and addresses...');

  const defaultAddressId = 'pickup-location-default';

  // Create system user for the pickup location
  const systemUser = await prisma.user.upsert({
    where: { phone: 'system-pickup' },
    update: {},
    create: {
      id: 'system-pickup-user',
      phone: 'system-pickup',
      fullName: 'Nalan Batters Store',
      role: 'ADMIN',
    },
  });

  // Create the default pickup address
  const pickupAddress = await prisma.address.upsert({
    where: { id: defaultAddressId },
    update: {},
    create: {
      id: defaultAddressId,
      userId: systemUser.id,
      street: '2623 Eglinton Ave E',
      unit: 'unit 1',
      city: 'Scarborough',
      province: 'ON',
      country: 'Canada',
      postal: 'M1K 2S2',
      isDeleted: false,
    },
  });

  // Set this address as the default address for the system user
  await prisma.user.update({
    where: { id: systemUser.id },
    data: {
      defaultAddressId: defaultAddressId,
    },
  });

  console.log('✅ System user and addresses created');
  return { systemUser, pickupAddress };
}

/**
 * Creates sample promo codes for testing and business use
 * @returns {Array} - Array of created promo code objects
 */
async function createMockPromoCodes() {
  console.log('🎫 Creating promo codes...');

  const createdPromoCodes = [];
  for (const promoData of MOCK_PROMO_CODE_DATA) {
    const { expiresAt, ...data } = promoData;

    // Calculate expiration date
    const expirationDate = expiresAt > 0
      ? new Date(Date.now() + expiresAt * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + expiresAt * 24 * 60 * 60 * 1000); // negative for expired

    const promoCode = await prisma.promoCode.create({
      data: {
        ...data,
        isActive: data.isActive !== undefined ? data.isActive : true,
        expiresAt: expirationDate,
      }
    });
    createdPromoCodes.push(promoCode);
  }

  console.log(`✅ Created ${createdPromoCodes.length} promo codes`);
  return createdPromoCodes;
}

// ===== MOCK DATA CREATION FUNCTIONS =====

/**
 * Creates mock users with realistic Canadian addresses
 * Each user gets multiple addresses in different delivery areas
 * @returns {Object} - Object containing arrays of users and addresses
 */
async function createMockUsers() {
  console.log('👥 Creating mock users...');

  const users = [];
  const addresses = [];

  for (let i = 0; i < CONFIG.USERS_COUNT; i++) {
    const phone = generateCanadianPhoneNumber();
    const fullName = faker.person.fullName();

    const user = await prisma.user.create({
      data: {
        phone,
        fullName,
        role: 'USER',
      },
    });

    users.push(user);

    // Create 1-3 addresses per user for better distribution
    const addressCount = Math.floor(Math.random() * CONFIG.MAX_ADDRESSES_PER_USER) + 1;
    for (let j = 0; j < addressCount; j++) {
      const address = await prisma.address.create({
        data: {
          userId: user.id,
          ...generateRealGTAAddress(),
          isDeleted: false,
        },
      });

      addresses.push(address);
    }

    if ((i + 1) % 10 === 0) {
      console.log(`✅ Created ${i + 1}/${CONFIG.USERS_COUNT} users with addresses`);
    }
  }

  console.log(`📊 Created ${users.length} users with ${addresses.length} total addresses`);
  return { users, addresses };
}

/**
 * Creates walk-in customer for POS orders (ESSENTIAL)
 * This customer is used for all POS transactions
 * @returns {Object} - Walk-in customer object
 */
async function createWalkInCustomer() {
  // Check if walk-in customer already exists
  let walkInUser = await prisma.user.findFirst({
    where: {
      phone: 'WALK_IN_CUSTOMER',
      role: 'USER'
    }
  });

  if (!walkInUser) {
    walkInUser = await prisma.user.create({
      data: {
        phone: 'WALK_IN_CUSTOMER',
        fullName: 'Walk-in Customer',
        role: 'USER'
      }
    });
  }

  return walkInUser;
}

/**
 * Creates store address for POS orders (ESSENTIAL)
 * @param {string} userId - User ID to associate address with
 * @returns {Object} - Store address object
 */
async function createStoreAddress(userId) {
  // Check if store address already exists
  let storeAddress = await prisma.address.findFirst({
    where: {
      userId: userId,
      street: 'STORE_PICKUP'
    }
  });

  if (!storeAddress) {
    storeAddress = await prisma.address.create({
      data: {
        userId: userId,
        street: 'STORE_PICKUP',
        city: 'Store Location',
        province: 'ON',
        country: 'Canada',
        postal: 'M1M1M1'
      }
    });
  }

  return storeAddress;
}

// ===== ORDER GENERATION FUNCTIONS =====

/**
 * Generates realistic orders for a specific date with STRICT one order per user per day maximum
 * Ensures no user can have multiple orders on the same day regardless of address
 * @param {Date} date - Date to generate orders for
 * @param {Array} products - Available products
 * @param {Array} users - Available users
 * @param {Array} addresses - Available addresses
 * @param {Array} promoCodes - Available promo codes
 * @param {Object} deliveryConfig - Delivery configuration object
 * @param {Set} usedUserAddressCombos - Set of "userId-addressId" combinations that already have orders for this date
 * @returns {Array} - Array of order objects
 */
function generateOrdersForDate(date, products, users, addresses, promoCodes, deliveryConfig, usedUsersForDate = new Set()) {
  const dayOfWeek = date.getDay();
  const baseDayMultiplier = MOCK_TIME_PATTERNS.DAILY[dayOfWeek] / 10;

  // Create a map of user addresses for faster lookup
  const userAddressMap = new Map();
  addresses.forEach(address => {
    if (!userAddressMap.has(address.userId)) {
      userAddressMap.set(address.userId, []);
    }
    userAddressMap.get(address.userId).push(address);
  });

  // Filter out users who already have orders for this date
  // This ensures one order per user per day maximum (strict constraint)
  const availableUsers = users.filter(user => !usedUsersForDate.has(user.id));
  const targetOrderCount = Math.floor(availableUsers.length * CONFIG.USER_ORDER_PROBABILITY * baseDayMultiplier);

  const orders = [];

  console.log(`🔍 Debug for ${date.toISOString().split('T')[0]}:`);
  console.log(`   � Users with orders today: ${usedUsersForDate.size}`);
  console.log(`   👥 Available users: ${availableUsers.length}/${users.length}`);
  console.log(`   🎯 Target orders: ${targetOrderCount}`);

  // Create array of available users (only one order per user per day)
  // For each user, select ONE delivery option (either delivery to one address OR pickup)
  const availableCombos = [];

  for (const user of availableUsers) {
    const userAddresses = userAddressMap.get(user.id) || [];
    const pickupAddress = addresses.find(addr => addr.id === 'pickup-location-default');

    // Collect all possible options for this user
    const userOptions = [];

    // Add delivery options
    for (const address of userAddresses) {
      userOptions.push({ user, address, deliveryType: 'DELIVERY' });
    }

    // Add pickup option
    if (pickupAddress) {
      userOptions.push({ user, address: pickupAddress, deliveryType: 'PICKUP' });
    }

    // If this user has any valid options, select ONE randomly
    if (userOptions.length > 0) {
      const selectedOption = userOptions[Math.floor(Math.random() * userOptions.length)];
      availableCombos.push(selectedOption);
    }
  }

  console.log(`   📋 Available combos: ${availableCombos.length}`);

  // Shuffle available combinations for random selection
  const shuffledCombos = availableCombos.sort(() => Math.random() - 0.5);

  // Take only the number of combinations we need for orders
  const selectedCombos = shuffledCombos.slice(0, Math.min(targetOrderCount, shuffledCombos.length));

  console.log(`   ✅ Selected combos: ${selectedCombos.length}`);

  for (const { user, address: selectedAddress, deliveryType } of selectedCombos) {
    // Generate realistic order time based on hourly patterns
    const hour = getWeightedRandom(MOCK_TIME_PATTERNS.HOURLY);
    const minute = Math.floor(Math.random() * 60);
    const orderTime = new Date(date);
    orderTime.setHours(parseInt(hour), minute, 0, 0);

    // Skip future dates
    if (orderTime > new Date()) continue;

    // Delivery type and address are already determined from the pre-selected combo
    const status = getWeightedRandom(MOCK_DISTRIBUTIONS.ORDER_STATUS);
    const paymentMethod = getWeightedRandom(MOCK_DISTRIBUTIONS.PAYMENT_METHOD);

    // Address is already determined from the pre-filtered selection
    const finalAddress = selectedAddress;
    let deliveryDate = null;

    if (deliveryType === 'PICKUP') {
      // Pickup orders can have a pickup date (same day or next day)
      deliveryDate = new Date(orderTime);
      if (Math.random() > 0.7) { // 30% chance of next-day pickup
        deliveryDate.setDate(deliveryDate.getDate() + 1);
      }
    } else {
      // DELIVERY - validate the delivery date
      const validDeliveryDate = findNextValidDeliveryDate(selectedAddress, orderTime, deliveryConfig);

      if (!validDeliveryDate) continue; // Skip if address cannot be delivered to on this date

      deliveryDate = validDeliveryDate;

      // Adjust delivery date based on order status for realism
      if (status === 'DELIVERED') {
        const maxDeliveryDate = new Date();
        if (deliveryDate > maxDeliveryDate) {
          // Try to find a valid delivery date in the past
          const pastOrderTime = new Date(orderTime);
          pastOrderTime.setDate(pastOrderTime.getDate() - 3); // Go back 3 days
          const pastValidDate = findNextValidDeliveryDate(selectedAddress, pastOrderTime, deliveryConfig, 7);
          if (pastValidDate && pastValidDate <= maxDeliveryDate) {
            deliveryDate = pastValidDate;
          } else {
            // Try next day if it's valid and in the past
            const nextDay = new Date(orderTime);
            nextDay.setDate(nextDay.getDate() + 1);
            if (nextDay <= maxDeliveryDate && validateDeliveryAvailability(selectedAddress, nextDay, deliveryConfig)) {
              deliveryDate = nextDay;
            } else {
              continue; // Skip this order
            }
          }
        }
      }

      // For pending/confirmed orders, delivery date should be in future (if order is recent)
      if ((status === 'PENDING' || status === 'CONFIRMED') && orderTime > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
        const futureValidDate = findNextValidDeliveryDate(selectedAddress, new Date(), deliveryConfig);
        if (futureValidDate) {
          deliveryDate = futureValidDate;
        }
      }
    }

    if (!finalAddress) continue; // Safety check

    // Mark this user as having an order today to prevent duplicates (critical constraint enforcement)
    usedUsersForDate.add(user.id);

    // Generate order items (1-4 items per order)
    const itemCount = Math.floor(Math.random() * 4) + 1;
    const orderItems = [];
    let subtotal = 0;

    for (let j = 0; j < itemCount; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
      const price = parseFloat(product.price);

      orderItems.push({
        productId: product.id,
        quantity,
        price: product.price,
      });

      subtotal += price * quantity;
    }

    // Calculate charges and discounts
    let deliveryCharges = 0;
    let convenienceCharges = 0;
    let tax = 0;
    let discount = 0;
    let promoCodeId = null;

    // Add delivery charges for delivery orders
    if (deliveryType === 'DELIVERY') {
      deliveryCharges = Math.floor(Math.random() * 5) + 3; // $3-7 delivery charge
      // Free delivery for orders over $50
      if (subtotal >= 50) {
        deliveryCharges = 0;
      }
    }

    // Add convenience charges (random 10% chance)
    if (Math.random() < 0.1) {
      convenienceCharges = 2.50; // Fixed convenience charge
    }

    // Apply promo code (30% chance)
    if (Math.random() < 0.3 && promoCodes.length > 0) {
      const availablePromoCodes = promoCodes.filter(promo =>
        promo.isActive &&
        (!promo.expiresAt || promo.expiresAt > orderTime)
      );

      if (availablePromoCodes.length > 0) {
        const promoCode = availablePromoCodes[Math.floor(Math.random() * availablePromoCodes.length)];
        promoCodeId = promoCode.id;

        if (promoCode.discountType === 'PERCENTAGE') {
          discount = subtotal * (parseFloat(promoCode.discount) / 100);
          // Cap percentage discounts at 50% of subtotal for reasonableness
          discount = Math.min(discount, subtotal * 0.5);
        } else if (promoCode.discountType === 'VALUE') {
          discount = Math.min(parseFloat(promoCode.discount), subtotal);
        }
      }
    }

    // Calculate tax (13% HST on subtotal + charges - discount)
    const taxableAmount = Math.max(0, subtotal + deliveryCharges + convenienceCharges - discount);
    tax = calculateHST(taxableAmount);

    // Calculate final total: subtotal + charges + tax - discount
    const totalAmount = subtotal + deliveryCharges + convenienceCharges + tax - discount;

    orders.push({
      userId: user.id,
      addressId: finalAddress.id,
      status,
      total: roundCurrency(totalAmount),
      deliveryCharges: deliveryCharges > 0 ? roundCurrency(deliveryCharges) : null,
      convenienceCharges: convenienceCharges > 0 ? roundCurrency(convenienceCharges) : null,
      tax: roundCurrency(tax),
      discount: discount > 0 ? roundCurrency(discount) : null,
      promoCodeId,
      deliveryType,
      orderType: 'ONLINE',
      paymentMethod,
      deliveryDate,
      createdAt: orderTime,
      updatedAt: orderTime,
      items: orderItems,
    });
  }

  return orders;
}

/**
 * Generates POS orders for a specific date
 * @param {Date} date - Date to generate orders for
 * @param {Array} products - Available products
 * @param {Object} walkInUser - Walk-in customer object
 * @param {Object} storeAddress - Store address object
 * @returns {Array} - Array of POS order objects
 */
function generatePosOrdersForDate(date, products, walkInUser, storeAddress) {
  const dayOfWeek = date.getDay();

  // POS orders only during business hours (skip Sundays and late nights)
  if (dayOfWeek === 0) return []; // No POS orders on Sunday

  const baseDayMultiplier = MOCK_TIME_PATTERNS.DAILY[dayOfWeek] / 10;
  const baseOrderCount = Math.floor(
    (CONFIG.POS_ORDERS_PER_DAY_MIN + Math.random() * (CONFIG.POS_ORDERS_PER_DAY_MAX - CONFIG.POS_ORDERS_PER_DAY_MIN)) * baseDayMultiplier
  );

  const orders = [];

  for (let i = 0; i < baseOrderCount; i++) {
    // Generate realistic POS order time based on business hours
    const hour = getWeightedRandom(MOCK_TIME_PATTERNS.POS_HOURLY);

    // Skip if hour is 0 (no POS orders at midnight)
    if (hour === '0') continue;

    const minute = Math.floor(Math.random() * 60);
    const orderTime = new Date(date);
    orderTime.setHours(parseInt(hour), minute, 0, 0);

    // Skip future dates
    if (orderTime > new Date()) continue;

    const paymentMethod = getWeightedRandom(MOCK_DISTRIBUTIONS.POS_PAYMENT);

    // Generate order items (1-3 items per POS order - typically smaller than online orders)
    const itemCount = Math.floor(Math.random() * 3) + 1;
    const orderItems = [];
    let subtotal = 0;

    for (let j = 0; j < itemCount; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 2) + 1; // 1-2 quantity for POS
      const price = parseFloat(product.price);

      orderItems.push({
        productId: product.id,
        quantity,
        price: product.price,
      });

      subtotal += price * quantity;
    }

    // Calculate tax (13% HST on subtotal - no other charges for POS)
    const tax = calculateHST(subtotal);

    // Calculate final total: subtotal + tax (no delivery or convenience charges for POS)
    const totalAmount = subtotal + tax;

    // Generate unique POS order number
    const orderNumber = generatePosOrderNumber();

    orders.push({
      orderNumber,
      userId: walkInUser.id,
      addressId: storeAddress.id,
      status: 'DELIVERED', // POS orders are immediately delivered
      total: roundCurrency(totalAmount),
      deliveryCharges: null,
      convenienceCharges: null,
      tax: roundCurrency(tax),
      discount: null,
      promoCodeId: null,
      deliveryType: 'PICKUP',
      orderType: 'POS',
      paymentMethod,
      deliveryDate: null,
      createdAt: orderTime,
      updatedAt: orderTime,
      items: orderItems,
    });
  }

  return orders;
}

/**
 * Creates mock online orders over the specified time period with realistic patterns
 * STRICT CONSTRAINT: Ensures each user has maximum one order per day (regardless of address)
 * @param {Array} users - Available users for order assignment
 * @param {Array} addresses - Available addresses for delivery
 * @param {Array} promoCodes - Available promo codes for discounts
 * @returns {Promise<number>} Total number of orders created
 */
async function createMockOrders(users, addresses, promoCodes) {
  console.log('📦 Creating mock online orders with one order per user per day...');

  if (!users.length || !addresses.length) {
    throw new Error('Cannot create orders without users and addresses');
  }

  // Load delivery configuration for validation
  const deliveryConfig = await loadDeliveryConfig();
  console.log('🚚 Loaded delivery configuration for order validation');

  // Get available products
  const products = await prisma.product.findMany({
    where: { isActive: true, isDelete: false },
  });

  if (products.length === 0) {
    throw new Error('No active products found. Please ensure products are created first.');
  }

  console.log(`📄 Using ${promoCodes.length} promo codes for order generation`);
  console.log(`👥 Creating orders for ${users.length} users with max one order per user per address per day`);

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - CONFIG.DAYS_TO_SIMULATE);

  let orderNumberCounter = 1;
  let totalOrdersCreated = 0;
  let skippedDeliveryOrders = 0;

  // Track which users have orders for each date to enforce one order per user per day
  const globalUsedUsers = new Map(); // Map<dateString, Set<userId>>

  // Generate orders for each day
  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    const currentDate = new Date(d);
    const dateString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format

    // Initialize tracking for this date
    if (!globalUsedUsers.has(dateString)) {
      globalUsedUsers.set(dateString, new Set());
    }

    const usedUsersForDate = globalUsedUsers.get(dateString);
    const orders = generateOrdersForDate(currentDate, products, users, addresses, promoCodes, deliveryConfig, usedUsersForDate);

    console.log(`📅 ${dateString}: Generated ${orders.length} orders from ${users.length} eligible users`);

    // Batch create orders for better performance
    const orderCreationPromises = orders.map(async (orderData) => {
      try {
        const { items, ...orderFields } = orderData;

        // Create order with unique incremental number
        const order = await prisma.order.create({
          data: {
            ...orderFields,
            orderNumber: (orderNumberCounter++).toString().padStart(5, '0'),
          },
        });

        // Create order items in batch
        const orderItemsData = items.map(item => ({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        }));

        await prisma.orderItem.createMany({
          data: orderItemsData,
        });

        return true;
      } catch (error) {
        console.error(`❌ Failed to create order: ${error.message}`);
        return false;
      }
    });

    const results = await Promise.allSettled(orderCreationPromises);
    const successfulOrders = results.filter(result => result.status === 'fulfilled' && result.value).length;
    totalOrdersCreated += successfulOrders;

    // Progress update every 10 days
    if ((currentDate.getDate() - startDate.getDate()) % 10 === 0) {
      const daysCompleted = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));
      console.log(`📈 Day ${daysCompleted}/${CONFIG.DAYS_TO_SIMULATE}: ${totalOrdersCreated} orders created`);
    }
  }

  if (skippedDeliveryOrders > 0) {
    console.log(`⚠️  Skipped ${skippedDeliveryOrders} delivery orders due to invalid delivery dates`);
  }

  // Calculate average orders per day and per user
  const avgOrdersPerDay = (totalOrdersCreated / CONFIG.DAYS_TO_SIMULATE).toFixed(1);
  const avgOrdersPerUser = (totalOrdersCreated / users.length).toFixed(1);

  console.log(`🎉 Created ${totalOrdersCreated} online orders over ${CONFIG.DAYS_TO_SIMULATE} days`);
  console.log(`📊 Average: ${avgOrdersPerDay} orders/day, ${avgOrdersPerUser} orders/user total`);
  console.log(`🎯 One order per user per day constraint: ENFORCED`);
  return totalOrdersCreated;
}

/**
 * Creates mock POS orders over the specified time period
 * @param {Object} walkInUser - Walk-in customer object for POS orders
 * @param {Object} storeAddress - Store address object for pickup location
 * @returns {Promise<number>} Total number of POS orders created
 */
async function createMockPosOrders(walkInUser, storeAddress) {
  console.log('🏪 Creating mock POS orders...');

  if (!walkInUser || !storeAddress) {
    throw new Error('Walk-in user and store address are required for POS orders');
  }

  // Get available products
  const products = await prisma.product.findMany({
    where: { isActive: true, isDelete: false },
  });

  if (products.length === 0) {
    throw new Error('No active products found. Please ensure products are created first.');
  }

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - CONFIG.DAYS_TO_SIMULATE);

  let totalPosOrdersCreated = 0;

  // Generate POS orders for each day
  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    const currentDate = new Date(d);
    const orders = generatePosOrdersForDate(currentDate, products, walkInUser, storeAddress);

    // Batch create POS orders for better performance
    const posOrderCreationPromises = orders.map(async (orderData) => {
      try {
        const { items, ...orderFields } = orderData;

        // Generate unique order number
        orderFields.orderNumber = await generateUniquePosOrderNumber();

        // Create order
        const order = await prisma.order.create({
          data: orderFields,
        });

        // Create order items in batch
        const orderItemsData = items.map(item => ({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        }));

        await prisma.orderItem.createMany({
          data: orderItemsData,
        });

        return true;
      } catch (error) {
        console.error(`❌ Failed to create POS order: ${error.message}`);
        return false;
      }
    });

    const results = await Promise.allSettled(posOrderCreationPromises);
    const successfulOrders = results.filter(result => result.status === 'fulfilled' && result.value).length;
    totalPosOrdersCreated += successfulOrders;

    // Progress update every 30 days
    if ((currentDate.getDate() - startDate.getDate()) % 30 === 0) {
      const daysCompleted = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));
      console.log(`🏪 Day ${daysCompleted}/${CONFIG.DAYS_TO_SIMULATE}: ${totalPosOrdersCreated} POS orders created`);
    }
  }

  console.log(`🎉 Created ${totalPosOrdersCreated} POS orders over ${CONFIG.DAYS_TO_SIMULATE} days`);
  return totalPosOrdersCreated;
}

// ===== DATA UPDATE FUNCTIONS =====

/**
 * Updates product stock levels to realistic values
 */
async function updateMockProductStock() {
  console.log('📦 Updating product stock levels...');

  const products = await prisma.product.findMany();

  for (const product of products) {
    // Random stock between 5 and 200
    const stock = Math.floor(Math.random() * 195) + 5;

    await prisma.product.update({
      where: { id: product.id },
      data: { stock },
    });
  }

  console.log(`✅ Updated stock for ${products.length} products`);
}

// ===== DELIVERY VALIDATION HELPERS =====

/**
 * Loads delivery configuration from database (ESSENTIAL)
 * @returns {Promise<Object>} Delivery configuration object with city-day mappings
 */
async function loadDeliveryConfig() {
  try {
    const config = await prisma.config.findFirst({
      where: {
        title: 'freeDelivery',
        isActive: true,
        isDelete: false
      }
    });

    if (!config?.value) {
      console.warn('⚠️  No delivery config found, using empty configuration');
      return {};
    }

    return config.value;
  } catch (error) {
    console.warn('⚠️  Could not load delivery config:', error.message);
    return {};
  }
}

/**
 * Validates if delivery is available for a given address and date
 * @param {Object} address - Address object with city property
 * @param {Date} deliveryDate - The proposed delivery date
 * @param {Object} deliveryConfig - Delivery configuration object
 * @returns {boolean} True if delivery is available for this city on this day
 */
function validateDeliveryAvailability(address, deliveryDate, deliveryConfig) {
  if (!address?.city || !deliveryConfig || !deliveryDate) {
    return false;
  }

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = daysOfWeek[deliveryDate.getDay()];

  const areasForDay = deliveryConfig[dayName];
  if (!Array.isArray(areasForDay) || areasForDay.length === 0) {
    return false;
  }

  // Check if the address city matches any of the delivery areas for this day
  return areasForDay.some(area =>
    area.toLowerCase().includes(address.city.toLowerCase()) ||
    address.city.toLowerCase().includes(area.toLowerCase())
  );
}

/**
 * Finds the next valid delivery date for a given address
 * @param {Object} address - Address object with city property
 * @param {Date} startDate - Date to start searching from
 * @param {Object} deliveryConfig - Delivery configuration object
 * @param {number} maxDaysToCheck - Maximum days to check ahead (default: 14)
 * @returns {Date|null} Next valid delivery date or null if none found
 */
function findNextValidDeliveryDate(address, startDate, deliveryConfig, maxDaysToCheck = 14) {
  for (let i = 1; i <= maxDaysToCheck; i++) {
    const testDate = new Date(startDate);
    testDate.setDate(testDate.getDate() + i);

    if (validateDeliveryAvailability(address, testDate, deliveryConfig)) {
      return testDate;
    }
  }
  return null;
}

// ===== MAIN POPULATION FUNCTION =====

/**
 * Main function that orchestrates the complete database population
 * Creates seed data and generates realistic mock data with proper error handling
 * @returns {Promise<void>}
 */
async function populateDatabase() {
  const startTime = Date.now();

  try {
    console.log('🚀 Starting complete database setup with seed and mock data...');

    // Validate configuration before starting
    validateConfiguration();

    console.log(`📊 Configuration: Generate Mock Data = ${CONFIG.GENERATE_MOCK_DATA}`);
    if (CONFIG.GENERATE_MOCK_DATA) {
      console.log(`📊 Mock Data Settings: ${CONFIG.USERS_COUNT} users, ${CONFIG.DAYS_TO_SIMULATE} days of data`);
      console.log(`📊 Orders per day: ${CONFIG.ORDERS_PER_DAY_MIN}-${CONFIG.ORDERS_PER_DAY_MAX} online (max 1 per user), ${CONFIG.POS_ORDERS_PER_DAY_MIN}-${CONFIG.POS_ORDERS_PER_DAY_MAX} POS`);
      console.log(`📊 User order probability: ${(CONFIG.USER_ORDER_PROBABILITY * 100).toFixed(0)}% per day, Max addresses per user: ${CONFIG.MAX_ADDRESSES_PER_USER}`);
    }

    // Step 0: Complete data wipe
    console.log('\n🗑️  Step 1/3: Clearing existing data...');
    await truncateAllData();

    // ===== ESSENTIAL SYSTEM DATA =====
    console.log('\n🏗️  Step 2/3: Creating essential system data...');
    const { systemUser, pickupAddress } = await createSystemUserAndAddresses();
    const walkInUser = await createWalkInCustomer();
    const storeAddress = await createStoreAddress(walkInUser.id);
    console.log('✅ Essential system data created');

    // ===== MOCK TEST DATA (OPTIONAL) =====
    let category, promoCodes, users, addresses, orderCount, posOrderCount;

    if (CONFIG.GENERATE_MOCK_DATA) {
      console.log('\n🎭 Step 3/3: Creating mock test data...');

      // Create mock categories and products
      console.log('   📁 Creating mock categories and products...');
      category = await createMockCategories();
      await createMockProducts(category);

      // Create mock promo codes
      console.log('   🎫 Creating mock promo codes...');
      promoCodes = await createMockPromoCodes();

      // Create mock users and addresses
      console.log('   👥 Creating mock users and addresses...');
      ({ users, addresses } = await createMockUsers());

      if (users.length === 0 || addresses.length === 0) {
        throw new Error('Failed to create sufficient users or addresses for order generation');
      }

      // Create online orders with realistic patterns
      console.log('   📦 Creating mock online orders...');
      orderCount = await createMockOrders(users, addresses, promoCodes);

      // Create POS orders
      console.log('   🏪 Creating mock POS orders...');
      posOrderCount = await createMockPosOrders(walkInUser, storeAddress);

      // Update product stock levels
      console.log('   📦 Updating mock product stock levels...');
      await updateMockProductStock();

      console.log('✅ Mock test data created');
    } else {
      console.log('\n⏭️  Step 3/3: Skipping mock data generation (GENERATE_MOCK_DATA = false)');
      promoCodes = [];
      users = [];
      addresses = [];
      orderCount = 0;
      posOrderCount = 0;
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // Log database statistics
    await logDatabaseStatistics();

    // Success summary
    console.log('\n🎉 Database setup completed successfully!');
    console.log('📈 Summary:');
    console.log(`   🏗️  Essential System Data:`);
    console.log(`      👤 System user: created`);
    console.log(`      🏠 System pickup address: created`);
    console.log(`      � Walk-in customer: created`);
    console.log(`      🏠 Store address: created`);

    if (CONFIG.GENERATE_MOCK_DATA) {
      console.log(`   🎭 Mock Test Data:`);
      console.log(`      📁 Categories created: 1`);
      console.log(`      📦 Products created: ${MOCK_PRODUCT_DATA.length}`);
      console.log(`      🎫 Promo codes created: ${promoCodes.length}`);
      console.log(`      👥 Mock users created: ${users.length}`);
      console.log(`      🏠 User addresses created: ${addresses.length}`);
      console.log(`      📦 Online orders created: ${orderCount}`);
      console.log(`      🏪 POS orders created: ${posOrderCount}`);
      console.log(`      📊 Total orders: ${orderCount + posOrderCount}`);
    } else {
      console.log(`   🎭 Mock Test Data: SKIPPED`);
    }

    console.log(`   ⏱️  Duration: ${duration} seconds`);
    console.log('\n💡 Database setup complete!');

    if (CONFIG.GENERATE_MOCK_DATA) {
      console.log('💡 Database populated with essential system data AND mock test data.');
      console.log('💡 You can view the data in Prisma Studio or the admin dashboard.');
    } else {
      console.log('💡 Database populated with essential system data only (no mock data).');
      console.log('💡 Set GENERATE_MOCK_DATA = true to include test users and orders.');
    }

  } catch (error) {
    console.error('\n❌ Database population failed:');
    console.error(`   Error: ${error.message}`);

    if (error.stack) {
      console.error(`   Stack: ${error.stack}`);
    }

    console.error('\n🔧 Troubleshooting tips:');
    console.error('   1. Ensure database is running and accessible');
    console.error('   2. Check database connection string and credentials');
    console.error('   3. Verify Prisma schema is up to date (run: npx prisma generate)');
    console.error('   4. Check if all required dependencies are installed');

    throw error;
  } finally {
    try {
      await prisma.$disconnect();
      console.log('📡 Database connection closed');
    } catch (disconnectError) {
      console.error('⚠️  Warning: Failed to disconnect from database:', disconnectError.message);
    }
  }
}

// ===== SCRIPT EXECUTION =====

// Run if called directly
populateDatabase()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

export { populateDatabase };
