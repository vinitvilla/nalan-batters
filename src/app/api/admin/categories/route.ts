import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { logError, logInfo } from "@/lib/logger"

// Create category
export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck instanceof NextResponse) return adminCheck;
  try {
    const { name } = await req.json();
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
    const category = await prisma.category.create({ data: { name } });
    logInfo(req.logger, { action: 'category_created', categoryId: category.id, name });
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    logError(req.logger, error, { action: 'category_create_failed' });
    return NextResponse.json({ error: "Failed to create category", details: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

// List categories
export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck instanceof NextResponse) return adminCheck;
  try {
    const categories = await prisma.category.findMany({
      where: { isDelete: false }
    });
    logInfo(req.logger, { action: 'categories_fetched', count: categories.length });
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    logError(req.logger, error, { action: 'categories_fetch_failed' });
    return NextResponse.json({ error: "Failed to fetch categories", details: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

// Update category
export async function PUT(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck instanceof NextResponse) return adminCheck;
  try {
    const { id, name } = await req.json();
    if (!id || !name) return NextResponse.json({ error: "Missing id or name" }, { status: 400 });
    const category = await prisma.category.update({ where: { id }, data: { name } });
    logInfo(req.logger, { action: 'category_updated', categoryId: id, name });
    return NextResponse.json(category, { status: 200 });
  } catch (error) {
    logError(req.logger, error, { action: 'category_update_failed' });
    return NextResponse.json({ error: "Failed to update category", details: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

// Delete category (soft delete)
export async function DELETE(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck instanceof NextResponse) return adminCheck;
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await prisma.category.update({
      where: { id },
      data: { isDelete: true }
    });
    logInfo(req.logger, { action: 'category_deleted', categoryId: id });
    return NextResponse.json({ message: "Category deleted" }, { status: 200 });
  } catch (error) {
    logError(req.logger, error, { action: 'category_delete_failed' });
    return NextResponse.json({ error: "Failed to delete category", details: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
