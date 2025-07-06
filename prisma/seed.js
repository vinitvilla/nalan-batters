const { PrismaClient } = require("../src/generated/prisma");
const prisma = new PrismaClient();

const seedProducts = require("./seeds/products");

async function main() {
  // Create or find the Dosa Batter category
  const category = await prisma.category.upsert({
    where: { name: "Dosa Batter" },
    update: {},
    create: { name: "Dosa Batter" },
  });

  await prisma.product.createMany({
    data: [
      {
        name: "1.5L Dosa Batter",
        description: "Fresh 1.5L dosa batter.",
        price: 10,
        imageUrl: "",
        stock: 100,
        isActive: true,
        categoryId: category.id,
      },
      {
        name: "2.5L Dosa Batter",
        description: "Fresh 2.5L dosa batter.",
        price: 15,
        imageUrl: "",
        stock: 100,
        isActive: true,
        categoryId: category.id,
      },
      {
        name: "5L Dosa Batter",
        description: "Fresh 5L dosa batter.",
        price: 28,
        imageUrl: "",
        stock: 100,
        isActive: true,
        categoryId: category.id,
      },
    ],
    skipDuplicates: true,
  });

  await seedProducts();
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
