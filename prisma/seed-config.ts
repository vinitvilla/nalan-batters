import { PrismaClient } from '@/generated/prisma';

async function seedConfigData(prismaClient?: PrismaClient) {
  const prisma = prismaClient || new PrismaClient();
  console.log('🌱 Seeding config data...');

  try {
    const configs = [
      // 1. Tax and Fee Configuration
      {
        title: 'additionalCharges',
        value: {
          taxPercent: { percent: 13, waive: false },
          convenienceCharge: { amount: 2.99, waive: false },
          deliveryCharge: { amount: 4.99, waive: false }
        },
        isActive: true
      },

      // 2. Free Delivery Areas Configuration
      {
        title: 'freeDelivery',
        value: {
          Thursday: ['Toronto', 'Brampton', 'Mississauga'],
          Friday: ['Pickering', 'Ajax', 'Whitby', 'Oshawa'],
          Saturday: ['Etobicoke', 'North York'],
          Sunday: ['Scarborough', 'Markham']
        },
        isActive: true
      },

      // 3. Order Settings
      {
        title: 'orderSettings',
        value: {
          minimumOrderAmount: 25.00,
          maxOrdersPerSlot: 50,
          orderCancellationWindow: 24,
          advanceOrderDays: 7
        },
        isActive: true
      },

      // 4. Business Hours
      {
        title: 'operatingHours',
        value: {
          Monday: { start: '09:00', end: '21:30', closed: false },
          Tuesday: { start: '09:00', end: '21:30', closed: false },
          Wednesday: { start: '09:00', end: '21:30', closed: false },
          Thursday: { start: '09:00', end: '21:30', closed: false },
          Friday: { start: '09:00', end: '21:30', closed: false },
          Saturday: { start: '09:00', end: '21:30', closed: false },
          Sunday: { start: '09:30', end: '21:30', closed: false }
        },
        isActive: true
      },

      // 5. Payment Settings
      {
        title: 'paymentSettings',
        value: {
          acceptCash: true,
          acceptCard: true,
          acceptOnline: true,
          minimumCardAmount: 10.00
        },
        isActive: true
      },

      // 6. Application Settings
      {
        title: 'appSettings',
        value: {
          maintenanceMode: false,
          allowGuestCheckout: true,
          enablePromoCode: true,
          maxCartItems: 20,
          logoUrl: 'https://yourdomain.com/logo.png'
        },
        isActive: true
      },

      // 7. Social Media Links
      {
        title: 'socialMediaLinks',
        value: {
          facebook: 'https://www.facebook.com/p/Nalan-Batters-61566853659372/',
          instagram: 'https://www.instagram.com/nalan_batters/',
          whatsApp: 'https://wa.me/14372154049',
          youtube: '',
          linkedin: '',
          twitter: '',
        },
        isActive: true
      },

      // 8. Contact Information
      {
        title: 'contactInfo',
        value: {
          phone: '+1 437-215 (4049)',
          email: 'hello@nalanbatters.ca',
          address: '2623 Eglinton Ave E unit 1, Scarborough, ON M1K 2S2, Canada',
        },
        isActive: true
      },
    ];

    // Create configs one by one to handle potential conflicts
    for (const config of configs) {
      try {
        // Try to find existing config
        const existing = await prisma.config.findUnique({
          where: { title: config.title }
        });

        if (existing) {
          // Update existing config
          await prisma.config.update({
            where: { title: config.title },
            data: {
              value: config.value,
              isActive: config.isActive
            }
          });
          console.log(`✓ Updated config: ${config.title}`);
        } else {
          // Create new config
          await prisma.config.create({
            data: {
              title: config.title,
              value: config.value,
              isActive: config.isActive
            }
          });
          console.log(`✓ Created config: ${config.title}`);
        }
      } catch (error) {
        console.error(`❌ Error processing config ${config.title}:`, error);
      }
    }

    console.log('✅ Config data seeded successfully!');

    // Display what was created
    const allConfigs = await prisma.config.findMany({ where: { isDelete: false } });
    console.log(`\n📊 Total configurations: ${allConfigs.length}`);
    allConfigs.forEach((config: any) => {
      console.log(`- ${config.title}: ${config.isActive ? 'Active' : 'Inactive'}`);
    });

  } catch (error) {
    console.error('❌ Error seeding config data:', error);
    throw error;
  } finally {
    // Only disconnect if we created our own client
    if (!prismaClient) {
      await prisma.$disconnect();
    }
  }
}

if (require.main === module) {
  seedConfigData();
}

export { seedConfigData };
