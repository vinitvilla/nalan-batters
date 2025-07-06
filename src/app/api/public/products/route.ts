import { NextRequest, NextResponse } from "next/server";
import { getProductsWithCategoryName } from "@/lib/utils/productHelpers";

export async function GET(req: NextRequest) {
  try {
    const productsWithCategoryName = await getProductsWithCategoryName();
    return NextResponse.json(productsWithCategoryName, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products", details: error }, { status: 500 });
  }
}