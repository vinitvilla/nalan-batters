const { PrismaClient } = require("./src/generated/prisma");
const prisma = new PrismaClient();

const seedCategory = require("./prisma/seeds/category");
const seedProducts = require("./prisma/seeds/product");
const seedConfig = require("./prisma/seeds/config");

async function main() {
  const category = await seedCategory();
  await seedProducts(category);
  await seedConfig();
  // Add more seeders here as your app grows
}

main()
  .then(() => {
    console.log("All seeds executed.");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
