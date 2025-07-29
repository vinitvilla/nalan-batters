const { PrismaClient } = require('../../src/generated/prisma');

const prisma = new PrismaClient();

async function createSampleOrders() {
  console.log('🛒 Creating sample orders for dashboard...');
  
  try {
    // Create a test customer
    const testUser = await prisma.user.upsert({
      where: { phone: '9876543210' },
      update: {},
      create: {
        id: 'test-customer-1',
        phone: '9876543210',
        fullName: 'Test Customer',
        role: 'USER',
      },
    });

    // Create a customer address
    const customerAddress = await prisma.address.upsert({
      where: { id: 'test-customer-address' },
      update: {},
      create: {
        id: 'test-customer-address',
        userId: testUser.id,
        street: '123 Test Street',
        unit: 'Apt 456',
        city: 'Toronto',
        province: 'ON',
        country: 'Canada',
        postal: 'M1M 1M1',
        isDeleted: false,
      },
    });

    // Get available products
    const products = await prisma.product.findMany({
      where: { isActive: true, isDelete: false },
      take: 3
    });

    if (products.length === 0) {
      console.log('❌ No products found. Please run seed first.');
      return;
    }

    // Create sample orders with different statuses and types
    const sampleOrders = [
      {
        id: 'order-1',
        orderNumber: 'ORD01',
        userId: testUser.id,
        addressId: customerAddress.id,
        status: 'DELIVERED',
        total: 25,
        orderType: 'DELIVERY',
        paymentMethod: 'ONLINE',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        items: [
          { productId: products[0].id, quantity: 1, price: products[0].price }
        ]
      },
      {
        id: 'order-2', 
        orderNumber: 'ORD02',
        userId: testUser.id,
        addressId: 'pickup-location-default',
        status: 'DELIVERED',
        total: 15,
        orderType: 'PICKUP',
        paymentMethod: 'CASH',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        items: [
          { productId: products[1].id, quantity: 1, price: products[1].price }
        ]
      },
      {
        id: 'order-3',
        orderNumber: 'ORD03', 
        userId: testUser.id,
        addressId: customerAddress.id,
        status: 'CONFIRMED',
        total: 43,
        orderType: 'DELIVERY',
        paymentMethod: 'ONLINE',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        items: [
          { productId: products[0].id, quantity: 1, price: products[0].price },
          { productId: products[2].id, quantity: 1, price: products[2].price }
        ]
      },
      {
        id: 'order-4',
        orderNumber: 'ORD04',
        userId: testUser.id,
        addressId: 'pickup-location-default',
        status: 'PENDING',
        total: 28,
        orderType: 'PICKUP',
        paymentMethod: 'CASH',
        createdAt: new Date(), // Today
        items: [
          { productId: products[2].id, quantity: 1, price: products[2].price }
        ]
      }
    ];

    for (const orderData of sampleOrders) {
      const { items, ...orderFields } = orderData;
      
      // Create order
      const order = await prisma.order.upsert({
        where: { id: orderData.id },
        update: orderFields,
        create: orderFields,
      });

      // Create order items
      for (const item of items) {
        await prisma.orderItem.upsert({
          where: { id: `${order.id}-${item.productId}` },
          update: {},
          create: {
            id: `${order.id}-${item.productId}`,
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          },
        });
      }

      console.log(`✅ Order created: ${order.orderNumber} (${order.status})`);
    }

    console.log('🎉 Sample orders created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating sample orders:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { createSampleOrders };

if (require.main === module) {
  createSampleOrders()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
