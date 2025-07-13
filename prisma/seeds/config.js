const { PrismaClient } = require("../../src/generated/prisma");
const prisma = new PrismaClient();

async function seedConfig() {
  await prisma.config.createMany({
    data: [
      {
        title: "tax_percent",
        value: { percent: 13 },
        isActive: true,
      },
      {
        title: "convenienceCharge",
        value: { amount: 0.99 },
        isActive: true,
      },
      {
        title: "deliveryCharge",
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
        title: "contactInfo",
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
}

module.exports = seedConfig;
