const { PrismaClient } = require('../src/generated/prisma');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

// Set faker locale for consistent Canadian data
faker.locale = 'en_CA';

// ===== CONFIGURATION =====

const CONFIG = {
  USERS_COUNT: 2,
  ORDERS_PER_DAY_MIN: 5,
  ORDERS_PER_DAY_MAX: 10,
  POS_ORDERS_PER_DAY_MIN: 3,
  POS_ORDERS_PER_DAY_MAX: 8,
  DAYS_TO_SIMULATE: 180, // 6 months of data
  ORDER_STATUSES: ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
  ORDER_TYPES: ['DELIVERY', 'PICKUP'],
  PAYMENT_METHODS: ['ONLINE', 'CASH'],
};

// Realistic order status distribution (%)
const STATUS_WEIGHTS = {
  DELIVERED: 60,
  CONFIRMED: 15,
  SHIPPED: 10,
  PENDING: 10,
  CANCELLED: 5,
};

// Order type distribution (%)
const ORDER_TYPE_WEIGHTS = {
  DELIVERY: 70,
  PICKUP: 30,
};

// Payment method distribution (%)
const PAYMENT_WEIGHTS = {
  ONLINE: 75,
  CASH: 25,
};

// POS payment method distribution (%)
const POS_PAYMENT_WEIGHTS = {
  CASH: 60,
  CARD: 40,
};

// Time-based order patterns (higher numbers = more orders)
const HOURLY_PATTERNS = {
  0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 2,
  6: 3, 7: 5, 8: 8, 9: 12, 10: 15, 11: 18,
  12: 20, 13: 18, 14: 15, 15: 12, 16: 10, 17: 8,
  18: 15, 19: 18, 20: 12, 21: 8, 22: 5, 23: 3,
};

// POS hourly patterns (peak during business hours)
const POS_HOURLY_PATTERNS = {
  0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
  6: 1, 7: 2, 8: 5, 9: 8, 10: 12, 11: 15,
  12: 18, 13: 20, 14: 15, 15: 12, 16: 10, 17: 8,
  18: 15, 19: 18, 20: 12, 21: 8, 22: 3, 23: 1,
};

// Day of week patterns (0 = Sunday)
const DAILY_PATTERNS = {
  0: 15, // Sunday
  1: 8,  // Monday
  2: 10, // Tuesday
  3: 12, // Wednesday
  4: 14, // Thursday
  5: 18, // Friday
  6: 20, // Saturday
};

// ===== UTILITY FUNCTIONS =====

/**
 * Returns a weighted random selection from an object of weights
 * @param {Object} weights - Object with keys and their corresponding weights
 * @returns {string} - Selected key
 */
function getWeightedRandom(weights) {
  const items = Object.keys(weights);
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
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
 * Generates a realistic Canadian phone number
 * @returns {string} - Formatted phone number (+1XXXXXXXXXX)
 */
function generateCanadianPhoneNumber() {
  const areaCodes = ['416', '647', '437', '905', '289', '365', '226', '519', '613', '343', '705', '249'];
  const areaCode = faker.helpers.arrayElement(areaCodes);
  const exchange = faker.string.numeric(3, { leadingZeros: false, bannedDigits: ['0', '1'] });
  const number = faker.string.numeric(4);
  
  return `+1${areaCode}${exchange}${number}`;
}

/**
 * Generates a unique 5-character alphanumeric order number for POS orders
 * @returns {string} - 5-character order number
 */
function generatePosOrderNumber() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let orderNumber = '';
  for (let i = 0; i < 5; i++) {
    orderNumber += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return orderNumber;
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
  
  await prisma.product.createMany({
    data: [
      {
        name: "1.5L Dosa Batter",
        description: "Fresh 1.5L dosa batter.",
        price: 10,
        imageUrl: "",
        stock: 100,
        isActive: true,
        categoryId: category.id,
      },
      {
        name: "2.5L Dosa Batter",
        description: "Fresh 2.5L dosa batter.",
        price: 15,
        imageUrl: "",
        stock: 100,
        isActive: true,
        categoryId: category.id,
      },
      {
        name: "5L Dosa Batter",
        description: "Fresh 5L dosa batter.",
        price: 28,
        imageUrl: "",
        stock: 100,
        isActive: true,
        categoryId: category.id,
      },
      {
        name: "Idli Mix 500g",
        description: "Ready to use idli mix - 500g pack.",
        price: 8,
        imageUrl: "",
        stock: 100,
        isActive: true,
        categoryId: category.id,
      },
      {
        name: "Vada Mix 400g",
        description: "Instant vada mix - just add water and fry.",
        price: 6,
        imageUrl: "",
        stock: 100,
        isActive: true,
        categoryId: category.id,
      },
      {
        name: "Uttapam Batter 1L",
        description: "Fresh uttapam batter for crispy uttapams.",
        price: 12,
        imageUrl: "",
        stock: 100,
        isActive: true,
        categoryId: category.id,
      },
    ],
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
  
  const promoCodes = [
    {
      code: 'WELCOME10',
      discount: 10.00,
      discountType: 'PERCENTAGE',
      description: 'Welcome discount - 10% off your order',
      minOrderAmount: 25.00,
      maxDiscount: 15.00,
      usageLimit: 100,
      isActive: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    },
    {
      code: 'SAVE5',
      discount: 5.00,
      discountType: 'VALUE',
      description: 'Get $5 off your order',
      minOrderAmount: 30.00,
      maxDiscount: 5.00,
      usageLimit: 200,
      isActive: true,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days from now
    },
    {
      code: 'BIGORDER',
      discount: 15.00,
      discountType: 'PERCENTAGE',
      description: 'Big order discount - 15% off orders over $75',
      minOrderAmount: 75.00,
      maxDiscount: 25.00,
      usageLimit: 50,
      isActive: true,
      expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000) // 45 days from now
    },
    {
      code: 'FIRSTORDER',
      discount: 3.00,
      discountType: 'VALUE',
      description: 'First order discount - $3 off',
      minOrderAmount: 20.00,
      maxDiscount: 3.00,
      usageLimit: 500,
      isActive: true,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
    },
    {
      code: 'BULK20',
      discount: 20.00,
      discountType: 'PERCENTAGE',
      description: 'Bulk order special - 20% off orders over $100',
      minOrderAmount: 100.00,
      maxDiscount: 40.00,
      usageLimit: 25,
      isActive: true,
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 days from now
    },
    {
      code: 'WEEKEND15',
      discount: 15.00,
      discountType: 'PERCENTAGE',
      description: 'Weekend special - 15% off',
      minOrderAmount: 40.00,
      maxDiscount: 20.00,
      usageLimit: 75,
      isActive: true,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    },
    {
      code: 'FLAT10',
      discount: 10.00,
      discountType: 'VALUE',
      description: 'Flat $10 off your order',
      minOrderAmount: 50.00,
      maxDiscount: 10.00,
      usageLimit: 150,
      isActive: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
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
      expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
    }
  ];
  
  const createdPromoCodes = [];
  for (const promoData of promoCodes) {
    const promoCode = await prisma.promoCode.create({
      data: promoData
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
          street: faker.location.streetAddress(),
          unit: Math.random() > 0.5 ? faker.location.secondaryAddress() : null,
          city: faker.helpers.arrayElement(['Toronto', 'Mississauga', 'Brampton', 'Markham', 'Scarborough', 'North York']),
          province: 'ON',
          country: 'Canada',
          postal: faker.location.zipCode('### ###'),
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
 * @returns {Array} - Array of order objects
 */
function generateOrdersForDate(date, products, users, addresses, promoCodes) {
  const dayOfWeek = date.getDay();
  const baseDayMultiplier = DAILY_PATTERNS[dayOfWeek] / 10;
  const baseOrderCount = Math.floor(
    (CONFIG.ORDERS_PER_DAY_MIN + Math.random() * (CONFIG.ORDERS_PER_DAY_MAX - CONFIG.ORDERS_PER_DAY_MIN)) * baseDayMultiplier
  );
  
  const orders = [];
  
  for (let i = 0; i < baseOrderCount; i++) {
    // Generate realistic order time based on hourly patterns
    const hour = getWeightedRandom(HOURLY_PATTERNS);
    const minute = Math.floor(Math.random() * 60);
    const orderTime = new Date(date);
    orderTime.setHours(parseInt(hour), minute, 0, 0);
    
    // Skip future dates
    if (orderTime > new Date()) continue;
    
    const orderType = getWeightedRandom(ORDER_TYPE_WEIGHTS);
    const status = getWeightedRandom(STATUS_WEIGHTS);
    const paymentMethod = getWeightedRandom(PAYMENT_WEIGHTS);
    
    // Select random user and appropriate address
    const user = users[Math.floor(Math.random() * users.length)];
    let addressId;
    
    if (orderType === 'PICKUP') {
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
    if (orderType === 'DELIVERY') {
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
    tax = taxableAmount * 0.13;
    
    // Calculate final total: subtotal + charges + tax - discount
    const totalAmount = subtotal + deliveryCharges + convenienceCharges + tax - discount;
    
    // Generate realistic delivery date based on order type and status
    let deliveryDate = null;
    if (orderType === 'DELIVERY') {
      const deliveryDays = Math.floor(Math.random() * 3) + 1; // 1-3 days for delivery
      deliveryDate = new Date(orderTime);
      deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);
      
      // For delivered orders, ensure delivery date is in the past
      if (status === 'DELIVERED') {
        const maxDeliveryDate = new Date();
        if (deliveryDate > maxDeliveryDate) {
          deliveryDate = new Date(orderTime);
          deliveryDate.setDate(deliveryDate.getDate() + 1); // Next day delivery for recent orders
        }
      }
      
      // For pending/confirmed orders, delivery date should be in future (if order is recent)
      if ((status === 'PENDING' || status === 'CONFIRMED') && orderTime > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
        deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + Math.floor(Math.random() * 3) + 1);
      }
    } else if (orderType === 'PICKUP') {
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
      total: Math.round(totalAmount * 100) / 100, // Round to 2 decimal places
      deliveryCharges: deliveryCharges > 0 ? Math.round(deliveryCharges * 100) / 100 : null,
      convenienceCharges: convenienceCharges > 0 ? Math.round(convenienceCharges * 100) / 100 : null,
      tax: Math.round(tax * 100) / 100,
      discount: discount > 0 ? Math.round(discount * 100) / 100 : null,
      promoCodeId,
      orderType,
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
  
  const baseDayMultiplier = DAILY_PATTERNS[dayOfWeek] / 10;
  const baseOrderCount = Math.floor(
    (CONFIG.POS_ORDERS_PER_DAY_MIN + Math.random() * (CONFIG.POS_ORDERS_PER_DAY_MAX - CONFIG.POS_ORDERS_PER_DAY_MIN)) * baseDayMultiplier
  );
  
  const orders = [];
  
  for (let i = 0; i < baseOrderCount; i++) {
    // Generate realistic POS order time based on business hours
    const hour = getWeightedRandom(POS_HOURLY_PATTERNS);
    
    // Skip if hour is 0 (no POS orders at midnight)
    if (hour === '0') continue;
    
    const minute = Math.floor(Math.random() * 60);
    const orderTime = new Date(date);
    orderTime.setHours(parseInt(hour), minute, 0, 0);
    
    // Skip future dates
    if (orderTime > new Date()) continue;
    
    const paymentMethod = getWeightedRandom(POS_PAYMENT_WEIGHTS);
    
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
    const tax = subtotal * 0.13;
    
    // Calculate final total: subtotal + tax (no delivery or convenience charges for POS)
    const totalAmount = subtotal + tax;
    
    // Generate unique POS order number
    const orderNumber = generatePosOrderNumber();
    
    orders.push({
      orderNumber,
      userId: walkInUser.id,
      addressId: storeAddress.id,
      status: 'DELIVERED', // POS orders are immediately delivered
      total: Math.round(totalAmount * 100) / 100,
      deliveryCharges: null,
      convenienceCharges: null,
      tax: Math.round(tax * 100) / 100,
      discount: null,
      promoCodeId: null,
      orderType: 'PICKUP',
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
 * Creates mock online orders over the specified time period
 * @param {Array} users - Available users
 * @param {Array} addresses - Available addresses
 * @param {Array} promoCodes - Available promo codes
 * @returns {number} - Total number of orders created
 */
async function createMockOrders(users, addresses, promoCodes) {
  console.log('📦 Creating mock orders...');
  
  // Get available products
  const products = await prisma.product.findMany({
    where: { isActive: true, isDelete: false },
  });
  
  if (products.length === 0) {
    throw new Error('No products found. Please run seed first.');
  }
  
  console.log(`📄 Using ${promoCodes.length} promo codes for order generation`);
  
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - CONFIG.DAYS_TO_SIMULATE);
  
  let orderNumber = 1;
  let totalOrdersCreated = 0;
  
  // Generate orders for each day
  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    const currentDate = new Date(d);
    const orders = generateOrdersForDate(currentDate, products, users, addresses, promoCodes);
    
    for (const orderData of orders) {
      const { items, ...orderFields } = orderData;
      
      // Create order
      const order = await prisma.order.create({
        data: {
          ...orderFields,
          orderNumber: orderNumber.toString().padStart(5, '0'), // Just the number, padded to 5 digits
        },
      });
      
      // Create order items
      for (const item of items) {
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          },
        });
      }
      
      orderNumber++;
      totalOrdersCreated++;
    }
    
    // Progress update every 10 days
    if ((currentDate.getDate() - startDate.getDate()) % 10 === 0) {
      const daysCompleted = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));
      console.log(`📈 Day ${daysCompleted}/${CONFIG.DAYS_TO_SIMULATE}: ${totalOrdersCreated} orders created`);
    }
  }
  
  console.log(`🎉 Created ${totalOrdersCreated} orders over ${CONFIG.DAYS_TO_SIMULATE} days`);
  return totalOrdersCreated;
}

/**
 * Creates mock POS orders over the specified time period
 * @param {Object} walkInUser - Walk-in customer object
 * @param {Object} storeAddress - Store address object
 * @returns {number} - Total number of POS orders created
 */
async function createMockPosOrders(walkInUser, storeAddress) {
  console.log('🏪 Creating mock POS orders...');
  
  // Get available products
  const products = await prisma.product.findMany({
    where: { isActive: true, isDelete: false },
  });
  
  if (products.length === 0) {
    throw new Error('No products found. Please run seed first.');
  }
  
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - CONFIG.DAYS_TO_SIMULATE);
  
  let totalPosOrdersCreated = 0;
  const usedOrderNumbers = new Set();
  
  // Generate POS orders for each day
  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    const currentDate = new Date(d);
    const orders = generatePosOrdersForDate(currentDate, products, walkInUser, storeAddress);
    
    for (const orderData of orders) {
      const { items, ...orderFields } = orderData;
      
      // Ensure unique order number
      let attempts = 0;
      while (usedOrderNumbers.has(orderFields.orderNumber) && attempts < 10) {
        orderFields.orderNumber = generatePosOrderNumber();
        attempts++;
      }
      
      if (attempts >= 10) {
        console.warn('⚠️  Skipping POS order due to order number collision');
        continue;
      }
      
      usedOrderNumbers.add(orderFields.orderNumber);
      
      // Create order
      const order = await prisma.order.create({
        data: orderFields,
      });
      
      // Create order items
      for (const item of items) {
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          },
        });
      }
      
      totalPosOrdersCreated++;
    }
    
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

// ===== MAIN POPULATION FUNCTION =====

/**
 * Main function that orchestrates the complete database population
 * Creates seed data and generates realistic mock data
 */
async function populateDatabase() {
  try {
    console.log('🚀 Starting complete database setup with seed and mock data...');
    console.log(`📊 Configuration: ${CONFIG.USERS_COUNT} users, ${CONFIG.DAYS_TO_SIMULATE} days of data`);
    console.log(`📊 Orders per day: ${CONFIG.ORDERS_PER_DAY_MIN}-${CONFIG.ORDERS_PER_DAY_MAX} online, ${CONFIG.POS_ORDERS_PER_DAY_MIN}-${CONFIG.POS_ORDERS_PER_DAY_MAX} POS`);
    
    const startTime = Date.now();
    
    // Step 0: Complete data wipe
    await truncateAllData();
    
    // Step 1: Create seed data (categories, products, addresses, config)
    const category = await createCategories();
    await createProducts(category);
    const { systemUser, pickupAddress } = await createSystemUserAndAddresses();
    
    // Step 2: Create promo codes (dynamic business data)
    const promoCodes = await createMockPromoCodes();
    
    // Step 3: Create mock users and addresses
    const { users, addresses } = await createMockUsers();
    
    // Step 4: Create online orders with realistic patterns
    const orderCount = await createMockOrders(users, addresses, promoCodes);
    
    // Step 5: Create walk-in customer for POS orders
    const walkInUser = await createWalkInCustomer();
    const storeAddress = await createStoreAddress(walkInUser.id);
    
    // Step 6: Create POS orders
    const posOrderCount = await createMockPosOrders(walkInUser, storeAddress);
    
    // Step 7: Update product stock levels
    await updateProductStock();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n🎉 Complete database setup completed successfully!');
    console.log('📈 Summary:');
    console.log(`   📁 Categories created: 1`);
    console.log(`   📦 Products created: 6`);
    console.log(`   🏠 System addresses created: 1`);
    console.log(`   🎫 Promo codes created: ${promoCodes.length}`);
    console.log(`   👥 Mock users created: ${users.length}`);
    console.log(`   🏠 User addresses created: ${addresses.length}`);
    console.log(`   📦 Online orders created: ${orderCount}`);
    console.log(`   🏪 POS orders created: ${posOrderCount}`);
    console.log(`   📊 Total orders: ${orderCount + posOrderCount}`);
    console.log(`   ⏱️  Duration: ${duration} seconds`);
    console.log('\n💡 Database is now completely set up with both seed and mock data!');
    console.log('💡 You can view the data in the admin dashboard!');
    
  } catch (error) {
    console.error('❌ Error populating database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
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
