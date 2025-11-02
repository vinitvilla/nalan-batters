import { PrismaClient } from '@/generated/prisma';

async function seedPickupLocation(prismaClient?: PrismaClient) {
  const prisma = prismaClient || new PrismaClient();
  console.log('🌱 Seeding pickup location and system users...');

  try {
    // Create or update system pickup user
    const systemUser = await prisma.user.upsert({
      where: { phone: 'system-pickup' },
      update: {
        fullName: 'Nalan Batters Store',
        role: 'USER',
      },
      create: {
        id: 'system-pickup-user',
        phone: 'system-pickup',
        fullName: 'Nalan Batters Store',
        role: 'USER',
      },
    });
    console.log(`✓ System pickup user: ${systemUser.id}`);

    // Create or update walk-in customer user (for POS sales without customer info)
    const walkInUser = await prisma.user.upsert({
      where: { phone: 'WALK_IN_CUSTOMER' },
      update: {
        fullName: 'Walk-in Customer',
        role: 'USER',
      },
      create: {
        id: 'walk-in-customer-user',
        phone: 'WALK_IN_CUSTOMER',
        fullName: 'Walk-in Customer',
        role: 'USER',
      },
    });
    console.log(`✓ Walk-in customer user: ${walkInUser.id}`);

    // Create or update pickup address
    const pickupAddress = await prisma.address.upsert({
      where: { id: 'pickup-location-default' },
      update: {
        street: 'STORE_PICKUP',
        city: 'Store Location',
        province: 'ON',
        country: 'Canada',
        postal: 'M1M1M1',
        isDeleted: false,
      },
      create: {
        id: 'pickup-location-default',
        userId: systemUser.id,
        street: 'STORE_PICKUP',
        city: 'Store Location',
        province: 'ON',
        country: 'Canada',
        postal: 'M1M1M1',
      },
    });
    console.log(`✓ Pickup address: ${pickupAddress.id}`);

    console.log('✅ Pickup location and system users seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding pickup location:', error);
    throw error;
  } finally {
    // Only disconnect if we created our own client
    if (!prismaClient) {
      await prisma.$disconnect();
    }
  }
}

if (require.main === module) {
  seedPickupLocation();
}

export { seedPickupLocation };
