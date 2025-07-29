const { PrismaClient } = require('../../src/generated/prisma');

const prisma = new PrismaClient();
const defaultAddressId = 'pickup-location-default';
const addresses = [
  {
    id: defaultAddressId,
    street: '2623 Eglinton Ave E',
    unit: 'unit 1',
    city: 'Scarborough',
    province: 'ON',
    country: 'Canada',
    postal: 'M1K 2S2',
    isDeleted: false,
  },
];

async function seedAddresses() {
  // First, create or find a system user for the pickup location
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
  
  // Update the addresses to use the system user ID
  const addressesWithSystemUser = addresses.map(addr => ({
    ...addr,
    userId: systemUser.id
  }));
  
  for (const address of addressesWithSystemUser) {
    await prisma.address.upsert({
      where: { id: address.id },
      update: address,
      create: address,
    });
  }

  // make this address the default address for the system user
  await prisma.user.update({
    where: { id: systemUser.id },
    data: {
      defaultAddressId: defaultAddressId,
    },
  });
}

module.exports = { seedAddresses };

if (require.main === module) {
  seedAddresses()
    .catch((e) => {
      console.error('❌ Error seeding addresses:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
