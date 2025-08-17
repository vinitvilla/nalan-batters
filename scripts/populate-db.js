const { PrismaClient } = require('../src/generated/prisma');
const { faker } = require('@faker-js/faker');

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
}

// ===== CONFIGURATION =====

/**
 * Main configuration object for database population
 * Adjust these values to control the amount of test data generated
 */
const CONFIG = {
  /** Number of mock users to create (1-10000) */
  USERS_COUNT: 2,
  /** Minimum orders per day for online orders (realistic range) */
  ORDERS_PER_DAY_MIN: 5,
  /** Maximum orders per day for online orders (realistic range) */
  ORDERS_PER_DAY_MAX: 10,
  /** Minimum POS orders per day (store pickup orders) */
  POS_ORDERS_PER_DAY_MIN: 3,
  /** Maximum POS orders per day (store pickup orders) */
  POS_ORDERS_PER_DAY_MAX: 8,
  /** Number of days to simulate historical data (1-365) */
  DAYS_TO_SIMULATE: 180, // 6 months of data
};

/**
 * Product data configuration for seeding the database
 * These represent the core products offered by the business
 */
const PRODUCT_DATA = [
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
 * Promo code data configuration for business promotions
 * Includes various discount types and conditions for testing
 */
const PROMO_CODE_DATA = [
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
 * Realistic distribution patterns for various order attributes
 * Based on typical e-commerce and food delivery business patterns
 */
const DISTRIBUTIONS = {
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
 * Time-based order patterns to simulate realistic ordering behavior
 * Higher numbers indicate more orders during that time period
 */
const TIME_PATTERNS = {
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
    console.log(`      📦 Delivery Orders: ${deliveryOrders}`);
    console.log(`      🏪 Pickup Orders: ${pickupOrders}`);
    console.log(`      🔢 POS Orders: ${posOrders}`);
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
    
    // North York
    { street: '5000 Yonge St', unit: Math.random() > 0.5 ? `Unit ${Math.floor(Math.random() * 200) + 1}` : null, city: 'North York', postal: 'M2N 7E9' },
    { street: '4700 Keele St', unit: null, city: 'North York', postal: 'M3J 1P3' },
    { street: '1200 Sheppard Ave E', unit: Math.random() > 0.7 ? `Suite ${Math.floor(Math.random() * 100) + 10}` : null, city: 'North York', postal: 'M2K 2S5' },
    { street: '3401 Dufferin St', unit: Math.random() > 0.6 ? `Unit ${Math.floor(Math.random() * 150) + 1}` : null, city: 'North York', postal: 'M6A 2T9' },
    { street: '2200 Finch Ave W', unit: null, city: 'North York', postal: 'M3N 2V7' },
    
    // Scarborough
    { street: '300 Borough Dr', unit: Math.random() > 0.5 ? `Apt ${Math.floor(Math.random() * 800) + 100}` : null, city: 'Scarborough', postal: 'M1P 4P5' },
    { street: '4700 Lawrence Ave E', unit: null, city: 'Scarborough', postal: 'M1E 2V2' },
    { street: '1911 Kennedy Rd', unit: Math.random() > 0.7 ? `Unit ${Math.floor(Math.random() * 50) + 1}` : null, city: 'Scarborough', postal: 'M1P 2L9' },
    { street: '200 Town Centre Crt', unit: Math.random() > 0.6 ? `Suite ${Math.floor(Math.random() * 300) + 100}` : null, city: 'Scarborough', postal: 'M1P 4X4' },
    { street: '2623 Eglinton Ave E', unit: 'Unit 1', city: 'Scarborough', postal: 'M1K 2S2' }, // Nalan Batters store
    
    // Mississauga
    { street: '100 City Centre Dr', unit: Math.random() > 0.8 ? `Unit ${Math.floor(Math.random() * 200) + 1}` : null, city: 'Mississauga', postal: 'L5B 2C9' },
    { street: '6800 Kitimat Rd', unit: null, city: 'Mississauga', postal: 'L5N 5L9' },
    { street: '3050 Confederation Pkwy', unit: Math.random() > 0.5 ? `Suite ${Math.floor(Math.random() * 150) + 10}` : null, city: 'Mississauga', postal: 'L5B 3Z9' },
    { street: '2151 Leanne Blvd', unit: Math.random() > 0.7 ? `Unit ${Math.floor(Math.random() * 100) + 1}` : null, city: 'Mississauga', postal: 'L5K 2L5' },
    { street: '4141 Dixie Rd', unit: null, city: 'Mississauga', postal: 'L4W 1V5' },
    
    // Brampton
    { street: '2 County Ct Blvd', unit: Math.random() > 0.6 ? `Suite ${Math.floor(Math.random() * 200) + 100}` : null, city: 'Brampton', postal: 'L6W 3W8' },
    { street: '25 Peel Centre Dr', unit: Math.random() > 0.5 ? `Unit ${Math.floor(Math.random() * 50) + 1}` : null, city: 'Brampton', postal: 'L6T 3R5' },
    { street: '50 Gillingham Dr', unit: null, city: 'Brampton', postal: 'L6X 5A5' },
    { street: '9025 Torbram Rd', unit: Math.random() > 0.7 ? `Unit ${Math.floor(Math.random() * 75) + 1}` : null, city: 'Brampton', postal: 'L6S 6H3' },
    { street: '7700 Hurontario St', unit: Math.random() > 0.8 ? `Apt ${Math.floor(Math.random() * 300) + 100}` : null, city: 'Brampton', postal: 'L6Y 4M3' },
    
    // Markham
    { street: '4800 Highway 7', unit: Math.random() > 0.5 ? `Unit ${Math.floor(Math.random() * 150) + 1}` : null, city: 'Markham', postal: 'L3R 1M2' },
    { street: '3601 Highway 7 E', unit: null, city: 'Markham', postal: 'L3R 0M3' },
    { street: '9350 Yonge St', unit: Math.random() > 0.6 ? `Suite ${Math.floor(Math.random() * 100) + 10}` : null, city: 'Markham', postal: 'L4C 5G2' },
    { street: '14 Cornerstone Dr', unit: Math.random() > 0.7 ? `Unit ${Math.floor(Math.random() * 50) + 1}` : null, city: 'Markham', postal: 'L3P 7N8' },
    { street: '5762 Highway 7', unit: null, city: 'Markham', postal: 'L3P 1A8' },
    
    // Ajax
    { street: '75 Bayly St W', unit: Math.random() > 0.5 ? `Unit ${Math.floor(Math.random() * 100) + 1}` : null, city: 'Ajax', postal: 'L1S 7K7' },
    { street: '1166 Harwood Ave N', unit: null, city: 'Ajax', postal: 'L1T 0B6' },
    { street: '50 Westney Rd N', unit: Math.random() > 0.6 ? `Suite ${Math.floor(Math.random() * 75) + 10}` : null, city: 'Ajax', postal: 'L1T 1P6' },
    
    // Pickering
    { street: '1355 Kingston Rd', unit: Math.random() > 0.7 ? `Unit ${Math.floor(Math.random() * 50) + 1}` : null, city: 'Pickering', postal: 'L1V 1B8' },
    { street: '1899 Brock Rd', unit: null, city: 'Pickering', postal: 'L1V 2P8' },
    { street: '533 Kingston Rd', unit: Math.random() > 0.5 ? `Suite ${Math.floor(Math.random() * 100) + 10}` : null, city: 'Pickering', postal: 'L1V 2R1' },
    
    // Whitby
    { street: '75 Consumers Dr', unit: Math.random() > 0.6 ? `Unit ${Math.floor(Math.random() * 150) + 1}` : null, city: 'Whitby', postal: 'L1N 9S2' },
    { street: '1615 Dundas St E', unit: null, city: 'Whitby', postal: 'L1N 1C4' },
    { street: '209 Dundas St W', unit: Math.random() > 0.5 ? `Suite ${Math.floor(Math.random() * 75) + 10}` : null, city: 'Whitby', postal: 'L1N 2M2' },
    
    // Oshawa
    { street: '419 King St W', unit: Math.random() > 0.7 ? `Unit ${Math.floor(Math.random() * 100) + 1}` : null, city: 'Oshawa', postal: 'L1J 2K5' },
    { street: '1300 Stevenson Rd N', unit: null, city: 'Oshawa', postal: 'L1J 5P5' },
    { street: '240 Taunton Rd E', unit: Math.random() > 0.5 ? `Suite ${Math.floor(Math.random() * 50) + 10}` : null, city: 'Oshawa', postal: 'L1G 3V2' },
    
    // Etobicoke  
    { street: '25 The West Mall', unit: Math.random() > 0.6 ? `Unit ${Math.floor(Math.random() * 200) + 1}` : null, city: 'Etobicoke', postal: 'M9C 1B8' },
    { street: '900 The Queensway', unit: null, city: 'Etobicoke', postal: 'M8Z 1N5' },
    { street: '1500 Royal York Rd', unit: Math.random() > 0.5 ? `Suite ${Math.floor(Math.random() * 100) + 10}` : null, city: 'Etobicoke', postal: 'M9P 3B4' },
  ];

  const selectedAddress = faker.helpers.arrayElement(gtaAddresses);
  
  return {
    street: selectedAddress.street,
    unit: selectedAddress.unit,
    city: selectedAddress.city,
    province: 'ON',
    country: 'Canada',
    postal: selectedAddress.postal,
  };
}

// ===== DATA CLEANUP FUNCTIONS =====

/**
 * Completely clears all data except config and Firebase admin users
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

// ===== SEED DATA CREATION FUNCTIONS =====

/**
 * Creates the main product category (Dosa Batter)
 * @returns {Object} - Created category object
 */
async function createCategories() {
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
async function createProducts(category) {
  console.log('📦 Creating products...');
  
  const productsData = PRODUCT_DATA.map(product => ({
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
 * Creates system user and default pickup address
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
  for (const promoData of PROMO_CODE_DATA) {
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
    
    // Create 1-2 addresses per user
    const addressCount = Math.floor(Math.random() * 2) + 1;
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
  
  return { users, addresses };
}

/**
 * Creates walk-in customer for POS orders
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
 * Creates store address for POS orders
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
 * Generates realistic orders for a specific date
 * @param {Date} date - Date to generate orders for
 * @param {Array} products - Available products
 * @param {Array} users - Available users
 * @param {Array} addresses - Available addresses
 * @param {Array} promoCodes - Available promo codes
 * @param {Object} deliveryConfig - Delivery configuration object
 * @returns {Array} - Array of order objects
 */
function generateOrdersForDate(date, products, users, addresses, promoCodes, deliveryConfig) {
  const dayOfWeek = date.getDay();
  const baseDayMultiplier = TIME_PATTERNS.DAILY[dayOfWeek] / 10;
  const baseOrderCount = Math.floor(
    (CONFIG.ORDERS_PER_DAY_MIN + Math.random() * (CONFIG.ORDERS_PER_DAY_MAX - CONFIG.ORDERS_PER_DAY_MIN)) * baseDayMultiplier
  );
  
  const orders = [];
  
  for (let i = 0; i < baseOrderCount; i++) {
    // Generate realistic order time based on hourly patterns
    const hour = getWeightedRandom(TIME_PATTERNS.HOURLY);
    const minute = Math.floor(Math.random() * 60);
    const orderTime = new Date(date);
    orderTime.setHours(parseInt(hour), minute, 0, 0);
    
    // Skip future dates
    if (orderTime > new Date()) continue;
    
    const deliveryType = getWeightedRandom(DISTRIBUTIONS.DELIVERY_TYPE);
    const status = getWeightedRandom(DISTRIBUTIONS.ORDER_STATUS);
    const paymentMethod = getWeightedRandom(DISTRIBUTIONS.PAYMENT_METHOD);
    
    // Select random user and appropriate address
    const user = users[Math.floor(Math.random() * users.length)];
    let addressId;
    
    if (deliveryType === 'PICKUP') {
      addressId = 'pickup-location-default';
    } else {
      // Use customer address or pickup location as fallback
      const customerAddresses = addresses.filter(addr => addr.userId === user.id && addr.id !== 'pickup-location-default');
      addressId = customerAddresses.length > 0 
        ? customerAddresses[Math.floor(Math.random() * customerAddresses.length)].id
        : 'pickup-location-default';
    }
    
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
    
    // Generate realistic delivery date based on delivery type and status
    let deliveryDate = null;
    if (deliveryType === 'DELIVERY') {
      // Get the address for this order to validate delivery availability
      const orderAddress = addresses.find(addr => addr.id === addressId);
      
      if (orderAddress && orderAddress.id !== 'pickup-location-default') {
        // Find next valid delivery date for this address
        const validDeliveryDate = findNextValidDeliveryDate(orderAddress, orderTime, deliveryConfig);
        
        if (validDeliveryDate) {
          deliveryDate = validDeliveryDate;
          
          // For delivered orders, ensure delivery date is in the past
          if (status === 'DELIVERED') {
            const maxDeliveryDate = new Date();
            if (deliveryDate > maxDeliveryDate) {
              // Try to find a valid delivery date in the past
              const pastOrderTime = new Date(orderTime);
              pastOrderTime.setDate(pastOrderTime.getDate() - 3); // Go back 3 days
              const pastValidDate = findNextValidDeliveryDate(orderAddress, pastOrderTime, deliveryConfig, 7);
              if (pastValidDate && pastValidDate <= maxDeliveryDate) {
                deliveryDate = pastValidDate;
              } else {
                // Fallback: just use next day from order time if it's valid
                const nextDay = new Date(orderTime);
                nextDay.setDate(nextDay.getDate() + 1);
                if (validateDeliveryAvailability(orderAddress, nextDay, deliveryConfig)) {
                  deliveryDate = nextDay;
                } else {
                  // Skip this delivery order if we can't find a valid date
                  continue;
                }
              }
            }
          }
          
          // For pending/confirmed orders, delivery date should be in future (if order is recent)
          if ((status === 'PENDING' || status === 'CONFIRMED') && orderTime > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
            const futureValidDate = findNextValidDeliveryDate(orderAddress, new Date(), deliveryConfig);
            if (futureValidDate) {
              deliveryDate = futureValidDate;
            }
          }
        } else {
          // No valid delivery date found for this address, skip this delivery order
          continue;
        }
      } else {
        // No valid address for delivery, skip this order
        continue;
      }
    } else if (deliveryType === 'PICKUP') {
      // Pickup orders can have a pickup date (same day or next day)
      deliveryDate = new Date(orderTime);
      if (Math.random() > 0.7) { // 30% chance of next-day pickup
        deliveryDate.setDate(deliveryDate.getDate() + 1);
      }
    }
    
    orders.push({
      userId: user.id,
      addressId,
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
  
  const baseDayMultiplier = TIME_PATTERNS.DAILY[dayOfWeek] / 10;
  const baseOrderCount = Math.floor(
    (CONFIG.POS_ORDERS_PER_DAY_MIN + Math.random() * (CONFIG.POS_ORDERS_PER_DAY_MAX - CONFIG.POS_ORDERS_PER_DAY_MIN)) * baseDayMultiplier
  );
  
  const orders = [];
  
  for (let i = 0; i < baseOrderCount; i++) {
    // Generate realistic POS order time based on business hours
    const hour = getWeightedRandom(TIME_PATTERNS.POS_HOURLY);
    
    // Skip if hour is 0 (no POS orders at midnight)
    if (hour === '0') continue;
    
    const minute = Math.floor(Math.random() * 60);
    const orderTime = new Date(date);
    orderTime.setHours(parseInt(hour), minute, 0, 0);
    
    // Skip future dates
    if (orderTime > new Date()) continue;
    
    const paymentMethod = getWeightedRandom(DISTRIBUTIONS.POS_PAYMENT);
    
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
 * @param {Array} users - Available users for order assignment
 * @param {Array} addresses - Available addresses for delivery
 * @param {Array} promoCodes - Available promo codes for discounts
 * @returns {Promise<number>} Total number of orders created
 */
async function createMockOrders(users, addresses, promoCodes) {
  console.log('📦 Creating mock online orders...');
  
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
  
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - CONFIG.DAYS_TO_SIMULATE);
  
  let orderNumberCounter = 1;
  let totalOrdersCreated = 0;
  let skippedDeliveryOrders = 0;
  
  // Generate orders for each day
  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    const currentDate = new Date(d);
    const orders = generateOrdersForDate(currentDate, products, users, addresses, promoCodes, deliveryConfig);
    
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
  
  console.log(`🎉 Created ${totalOrdersCreated} online orders over ${CONFIG.DAYS_TO_SIMULATE} days`);
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
async function updateProductStock() {
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
 * Loads the delivery configuration from the database
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
    
    console.log(`📊 Configuration: ${CONFIG.USERS_COUNT} users, ${CONFIG.DAYS_TO_SIMULATE} days of data`);
    console.log(`📊 Orders per day: ${CONFIG.ORDERS_PER_DAY_MIN}-${CONFIG.ORDERS_PER_DAY_MAX} online, ${CONFIG.POS_ORDERS_PER_DAY_MIN}-${CONFIG.POS_ORDERS_PER_DAY_MAX} POS`);
    
    // Step 0: Complete data wipe
    console.log('\n🗑️  Step 1/8: Clearing existing data...');
    await truncateAllData();
    
    // Step 1: Create seed data (categories, products, addresses, config)
    console.log('\n📁 Step 2/8: Creating core data structure...');
    const category = await createCategories();
    await createProducts(category);
    const { systemUser, pickupAddress } = await createSystemUserAndAddresses();
    
    // Step 2: Create promo codes (dynamic business data)
    console.log('\n🎫 Step 3/8: Creating promotional codes...');
    const promoCodes = await createMockPromoCodes();
    
    // Step 3: Create mock users and addresses
    console.log('\n👥 Step 4/8: Creating mock users and addresses...');
    const { users, addresses } = await createMockUsers();
    
    if (users.length === 0 || addresses.length === 0) {
      throw new Error('Failed to create sufficient users or addresses for order generation');
    }
    
    // Step 4: Create online orders with realistic patterns
    console.log('\n📦 Step 5/8: Creating online orders with delivery validation...');
    const orderCount = await createMockOrders(users, addresses, promoCodes);
    
    // Step 5: Create walk-in customer for POS orders
    console.log('\n🚶 Step 6/8: Setting up POS order infrastructure...');
    const walkInUser = await createWalkInCustomer();
    const storeAddress = await createStoreAddress(walkInUser.id);
    
    // Step 6: Create POS orders
    console.log('\n🏪 Step 7/8: Creating POS orders...');
    const posOrderCount = await createMockPosOrders(walkInUser, storeAddress);
    
    // Step 7: Update product stock levels
    console.log('\n📦 Step 8/8: Updating product stock levels...');
    await updateProductStock();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    // Log database statistics
    await logDatabaseStatistics();
    
    // Success summary
    console.log('\n🎉 Complete database setup completed successfully!');
    console.log('📈 Summary:');
    console.log(`   📁 Categories created: 1`);
    console.log(`   📦 Products created: ${PRODUCT_DATA.length}`);
    console.log(`   🏠 System addresses created: 1`);
    console.log(`   🎫 Promo codes created: ${promoCodes.length}`);
    console.log(`   👥 Mock users created: ${users.length}`);
    console.log(`   🏠 User addresses created: ${addresses.length}`);
    console.log(`   📦 Online orders created: ${orderCount}`);
    console.log(`   🏪 POS orders created: ${posOrderCount}`);
    console.log(`   📊 Total orders: ${orderCount + posOrderCount}`);
    console.log(`   ⏱️  Duration: ${duration} seconds`);
    console.log('\n💡 Database is now completely set up with both seed and mock data!');
    console.log('💡 You can view the data in the admin dashboard or run tests!');
    
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
if (require.main === module) {
  populateDatabase()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

module.exports = { populateDatabase };
