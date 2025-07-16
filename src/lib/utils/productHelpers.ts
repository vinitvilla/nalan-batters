import { prisma } from "@/lib/prisma";

export async function getProductsWithCategoryName() {
  const products = await prisma.product.findMany({
    where: { 
      isDelete: false,
      category: { isDelete: false }
    },
    include: { category: true },
  });
  return products.map((product) => ({
    ...product,
    category: product.category?.name || null,
  }));
}
