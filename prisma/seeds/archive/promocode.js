const { PrismaClient } = require('../../src/generated/prisma');

const prisma = new PrismaClient();

const promoCodes = [
  {
    code: 'WELCOME10',
    discount: 10.00,
    discountType: 'PERCENTAGE',
    isActive: true,
    expiresAt: new Date('2025-12-31'), // End of year
  },
  {
    code: 'SAVE20',
    discount: 20.00,
    discountType: 'PERCENTAGE', 
    isActive: true,
    expiresAt: new Date('2025-10-31'),
  },
  {
    code: 'FIRST15',
    discount: 15.00,
    discountType: 'PERCENTAGE',
    isActive: true,
    expiresAt: new Date('2025-12-31'),
  },
  {
    code: 'WEEKEND25',
    discount: 25.00,
    discountType: 'PERCENTAGE',
    isActive: true,
    expiresAt: new Date('2025-09-30'),
  },
  {
    code: 'FLAT50',
    discount: 50.00,
    discountType: 'VALUE',
    isActive: true,
    expiresAt: new Date('2025-12-31'),
  },
  {
    code: 'FLAT25',
    discount: 25.00,
    discountType: 'VALUE',
    isActive: true,
    expiresAt: new Date('2025-11-30'),
  },
  {
    code: 'STUDENT10',
    discount: 10.00,
    discountType: 'PERCENTAGE',
    isActive: true,
    expiresAt: new Date('2025-12-31'),
  },
  {
    code: 'BULK30',
    discount: 30.00,
    discountType: 'PERCENTAGE',
    isActive: true,
    expiresAt: new Date('2025-10-15'),
  },
  {
    code: 'FREE5',
    discount: 5.00,
    discountType: 'VALUE',
    isActive: true,
    expiresAt: new Date('2025-12-31'),
  },
  {
    code: 'HOLIDAY15',
    discount: 15.00,
    discountType: 'PERCENTAGE',
    isActive: true,
    expiresAt: new Date('2025-12-25'),
  },
];

async function seedPromoCodes() {
  console.log('🎫 Seeding promo codes...');

  try {
    // Clear existing promo codes
    await prisma.promoCode.deleteMany();
    
    // Create promo codes
    for (const promoData of promoCodes) {
      await prisma.promoCode.create({
        data: promoData,
      });
    }

    console.log(`✅ Created ${promoCodes.length} promo codes`);
  } catch (error) {
    console.error('❌ Error seeding promo codes:', error);
    throw error;
  }
}

module.exports = { seedPromoCodes };

// Run if called directly
if (require.main === module) {
  seedPromoCodes()
    .then(() => {
      console.log('✅ Promo codes seeded successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error seeding promo codes:', error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}
