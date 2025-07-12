const { PrismaClient } = require("../../src/generated/prisma");
const prisma = new PrismaClient();

async function seedProducts(category) {
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
}

module.exports = seedProducts;
