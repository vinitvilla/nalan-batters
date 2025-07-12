const { PrismaClient } = require("../../src/generated/prisma");
const prisma = new PrismaClient();

async function seedCategory() {
  // Create or find the Dosa Batter category
  const category = await prisma.category.upsert({
    where: { name: "Dosa Batter" },
    update: {},
    create: { name: "Dosa Batter" },
  });
  return category;
}

module.exports = seedCategory;
