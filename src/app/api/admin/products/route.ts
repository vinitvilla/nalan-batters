import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { getProductsWithCategoryName } from "@/lib/utils/productHelpers";

export async function POST(req: NextRequest) {
  // Admin check
  const adminCheck = await requireAdmin(req);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const body = await req.json();
    const { name, description, price, categoryId, imageUrl, stock } = body;
    if (!name || !price || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        imageUrl: imageUrl || null,
        stock: stock || 0,
        isActive: true,
        categoryId,
      },
      include: { category: true },
    });
    // Flatten category for response
    const productWithCategory = { ...product, category: product.category?.name || null };
    return NextResponse.json(productWithCategory, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add product", details: error }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Admin check
  const adminCheck = await requireAdmin(req);
  if (adminCheck instanceof NextResponse) return adminCheck;
  try {
    const productsWithCategoryName = await getProductsWithCategoryName();
    return NextResponse.json(productsWithCategoryName, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products", details: error }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  // Admin check
  const adminCheck = await requireAdmin(req);
  if (adminCheck instanceof NextResponse) return adminCheck;
  try {
    const body = await req.json();
    const { id, name, description, price, categoryId, imageUrl, stock } = body;
    if (!id) {
      return NextResponse.json({ error: "Missing product id" }, { status: 400 });
    }
    const updateData: Record<string, unknown> = {
      name,
      description,
      price,
      imageUrl,
      stock,
      isActive: true,
    };
    if (categoryId) {
      updateData.categoryId = categoryId;
    }
    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });
    // Flatten category for response
    const productWithCategory = { ...product, category: product.category?.name || null };
    return NextResponse.json(productWithCategory, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update product", details: error }, { status: 500 });
  }
}

// Delete product (soft delete)
export async function DELETE(req: NextRequest) {
  // Admin check
  const adminCheck = await requireAdmin(req);
  if (adminCheck instanceof NextResponse) return adminCheck;
  try {
    const body = await req.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: "Missing product id" }, { status: 400 });
    }
    await prisma.product.update({ 
      where: { id },
      data: { isDelete: true }
    });
    return NextResponse.json({ message: "Product deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete product", details: error }, { status: 500 });
  }
}
