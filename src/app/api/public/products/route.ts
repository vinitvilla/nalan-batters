import { NextResponse } from "next/server";
import { getProductsWithCategoryName } from "@/lib/utils/productHelpers";
import logger, { logDebug, logError } from "@/lib/logger"

export async function GET() {
  try {
    const productsWithCategoryName = await getProductsWithCategoryName();
    logDebug(logger, { endpoint: 'GET /api/public/products', action: 'products_fetched', count: productsWithCategoryName.length });
    return NextResponse.json(productsWithCategoryName, { status: 200 });
  } catch (error) {
    logError(logger, error, { endpoint: 'GET /api/public/products', action: 'products_fetch_failed' });
    return NextResponse.json({ error: "Failed to fetch products", details: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
