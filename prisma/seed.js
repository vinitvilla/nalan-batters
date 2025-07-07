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

  // Seed initial config values
  await prisma.config.createMany({
    data: [
      {
        title: "tax_percent",
        value: { percent: 13 },
        isActive: true,
      },
      {
        title: "convenience_charge",
        value: { amount: 0.99 },
        isActive: true,
      },
      {
        title: "delivery_charge",
        value: { amount: 4.99 },
        isActive: true,
      },
      {
        title: "social_links",
        value: {
          facebook: "https://www.facebook.com/p/Nalan-Batters-61566853659372/",
          instagram: "https://www.instagram.com/nalan_batters/",
          whatsapp: "https://wa.me/14372154049",
        },
        isActive: true,
      },
      {
        title: "logo_url",
        value: { url: "https://yourdomain.com/logo.png" },
        isActive: true,
      },
      {
        title: "free_delivery",
        value: {
          "Thursday": ["Mississauga", "Brampton", "Downtown Toronto"],
          "Friday": ["Pickering", "Ajax", "Whitby", "Oshawa"],
          "Saturday": ["Etobicoke", "Northyork"],
          "Sunday": ["Scarborough", "Markham (Until 407)"]
        },
        isActive: true,
      },
      {
        title: "contact_info",
        value: {
          email: "hello@nalanbatters.com",
          phone: "+1 437-215 (4049)",
          location: "2623 Eglinton Ave E unit 1, Scarborough, ON M1K 2S2, Canada",
        },
        isActive: true,
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
