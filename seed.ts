import { PrismaClient } from "./src/generated/prisma";
import { seedConfigData } from "./prisma/seed-config";
import { seedPickupLocation } from "./prisma/seed-pickup-location";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🌱 Starting database seeding...");
    
    // Seed config
    console.log("⚙️ Seeding config...");
    await seedConfigData(prisma);
    console.log("✅ Config seeded");
    
    // Seed pickup location
    console.log("📍 Seeding pickup location...");
    await seedPickupLocation(prisma);
    console.log("✅ Pickup location seeded");
    
    console.log("🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
