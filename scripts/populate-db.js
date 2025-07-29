const { PrismaClient } = require('../src/generated/prisma');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

// Set faker locale for consistent Canadian data
faker.locale = 'en_CA';

// Configuration
const CONFIG = {
  USERS_COUNT: 50,
  ORDERS_PER_DAY_MIN: 5,
  ORDERS_PER_DAY_MAX: 25,
  DAYS_TO_SIMULATE: 90, // 3 months of data
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

// Time-based order patterns (higher numbers = more orders)
const HOURLY_PATTERNS = {
  0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 2,
  6: 3, 7: 5, 8: 8, 9: 12, 10: 15, 11: 18,
  12: 20, 13: 18, 14: 15, 15: 12, 16: 10, 17: 8,
  18: 15, 19: 18, 20: 12, 21: 8, 22: 5, 23: 3,
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

function generateCanadianPhoneNumber() {
  // Generate a properly formatted Canadian phone number
  const areaCodes = ['416', '647', '437', '905', '289', '365', '226', '519', '613', '343', '705', '249'];
  const areaCode = faker.helpers.arrayElement(areaCodes);
  const exchange = faker.string.numeric(3, { leadingZeros: false, bannedDigits: ['0', '1'] });
  const number = faker.string.numeric(4);
  
  return `+1${areaCode}${exchange}${number}`;
}

async function truncateAllData() {
  console.log('🗑️  Truncating all existing data...');
  
  try {
    // Delete in correct order to avoid foreign key constraints
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    
    // Delete user addresses but keep pickup location
    await prisma.address.deleteMany({
      where: {
        NOT: {
          id: 'pickup-location-default'
        }
      }
    });
    
    // Delete users but keep the system user and admin users
    await prisma.user.deleteMany({
      where: {
        role: 'USER'
      }
    });
    
    // Delete promo codes (these are dynamic data, not seed data)
    await prisma.promoCode.deleteMany();
    
    console.log('✅ All mock data truncated successfully (preserved system data)');
  } catch (error) {
    console.error('❌ Error truncating data:', error);
    throw error;
  }
}

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

async function populateDatabase() {
  try {
    console.log('🚀 Starting database population with realistic mock data...');
    console.log(`📊 Configuration: ${CONFIG.USERS_COUNT} users, ${CONFIG.DAYS_TO_SIMULATE} days of data`);
    
    const startTime = Date.now();
    
    // Step 0: Truncate existing mock data
    await truncateAllData();
    
    // Step 1: Create promo codes (dynamic business data)
    const promoCodes = await createMockPromoCodes();
    
    // Step 2: Create users and addresses
    const { users, addresses } = await createMockUsers();
    
    // Step 3: Create orders with realistic patterns
    const orderCount = await createMockOrders(users, addresses, promoCodes);
    
    // Step 3: Update product stock levels
    await updateProductStock();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n🎉 Database population completed successfully!');
    console.log('📈 Summary:');
    console.log(`   🎫 Promo codes created: ${promoCodes.length}`);
    console.log(`   👥 Users created: ${users.length}`);
    console.log(`   🏠 Addresses created: ${addresses.length}`);
    console.log(`   📦 Orders created: ${orderCount}`);
    console.log(`   ⏱️  Duration: ${duration} seconds`);
    console.log('\n💡 You can now view realistic data in the admin dashboard!');
    
  } catch (error) {
    console.error('❌ Error populating database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  populateDatabase()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

module.exports = { populateDatabase };
