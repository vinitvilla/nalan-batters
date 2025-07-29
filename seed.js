const { PrismaClient } = require("./src/generated/prisma");
const seedConfig = require("./prisma/seeds/config");

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🌱 Starting database seeding...");
    
    
    // Seed config
    console.log("⚙️ Seeding config...");
    await seedConfig();
    console.log("✅ Config seeded");
    
    
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
