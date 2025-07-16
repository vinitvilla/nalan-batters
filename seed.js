const { PrismaClient } = require("./src/generated/prisma");
const prisma = new PrismaClient();

const seedConfig = require("./prisma/seeds/config");

async function main() {
  await seedConfig();
  console.log("Config data seeded.");
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
