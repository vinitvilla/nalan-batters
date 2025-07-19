const { PrismaClient } = require("../../src/generated/prisma");
const prisma = new PrismaClient();

async function seedConfig() {
  const configData = [
    {
      title: "taxPercent",
      value: { percent: 13, waive: true },
      isActive: true,
    },
    {
      title: "convenienceCharge",
      value: { amount: 0.99, waive: true },
      isActive: true,
    },
    {
      title: "deliveryCharge",
      value: { amount: 4.99, waive: true },
      isActive: true,
    },
    {
      title: "socialLinks",
      value: {
        facebook: "https://www.facebook.com/p/Nalan-Batters-61566853659372/",
        instagram: "https://www.instagram.com/nalan_batters/",
        whatsapp: "https://wa.me/14372154049",
      },
      isActive: true,
    },
    {
      title: "logoUrl",
      value: { url: "https://yourdomain.com/logo.png" },
      isActive: true,
    },
    {
      title: "freeDelivery",
      value: {
        "Thursday": ["Mississauga", "Brampton", "Downtown Toronto"],
        "Friday": ["Pickering", "Ajax", "Whitby", "Oshawa"],
        "Saturday": ["Etobicoke", "Northyork"],
        "Sunday": ["Scarborough", "Markham (Until 407)"]
      },
      isActive: true,
    },
    {
      title: "contactInfo",
      value: {
        email: "hello@nalanbatters.com",
        phone: "+1 437-215 (4049)",
        location: "2623 Eglinton Ave E unit 1, Scarborough, ON M1K 2S2, Canada",
      },
      isActive: true,
    },
  ];

  // Use upsert to update existing records or create new ones
  for (const config of configData) {
    await prisma.config.upsert({
      where: { title: config.title },
      update: {
        value: config.value,
        isActive: config.isActive,
      },
      create: config,
    });
  }

  console.log(`Updated/created ${configData.length} config entries`);
}

module.exports = seedConfig;
