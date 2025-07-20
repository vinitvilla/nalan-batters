const { PrismaClient } = require("./src/generated/prisma");
const seedCategory = require("./prisma/seeds/category");
const seedProducts = require("./prisma/seeds/product");
const seedConfig = require("./prisma/seeds/config");

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🌱 Starting database seeding...");
    
    // Seed categories first
    console.log("📁 Seeding categories...");
    const category = await seedCategory();
    console.log("✅ Categories seeded");
    
    // Seed products (depends on categories)
    console.log("📦 Seeding products...");
    await seedProducts(category);
    console.log("✅ Products seeded");
    
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
