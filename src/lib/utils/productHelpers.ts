import { prisma } from "@/lib/prisma";

export async function getProductsWithCategoryName() {
  const products = await prisma.product.findMany({
    include: { category: true },
  });
  return products.map((product) => ({
    ...product,
    category: product.category?.name || null,
  }));
}
