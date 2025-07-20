import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import moment from 'moment';

// Get all contact messages
export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const whereCondition = {
      isDelete: false,
      ...(status && status !== 'ALL' ? { status: status as any } : {}),
    };

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where: whereCondition,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.contactMessage.count({ where: whereCondition }),
    ]);

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch contact messages" },
      { status: 500 }
    );
  }
}

// Update contact message status
export async function PUT(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: "Message ID and status are required" },
        { status: 400 }
      );
    }

    const validStatuses = ['NEW', 'READ', 'INPROGRESS', 'RESOLVED'];
    if (!validStatuses.includes(status.toUpperCase())) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: NEW, READ, INPROGRESS, RESOLVED" },
        { status: 400 }
      );
    }

    const updatedMessage = await prisma.contactMessage.update({
      where: { id },
      data: { status: status.toUpperCase() as any, updatedAt: moment().toDate() },
    });

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error("Error updating contact message:", error);
    return NextResponse.json(
      { error: "Failed to update contact message" },
      { status: 500 }
    );
  }
}

// Delete contact message (soft delete)
export async function DELETE(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Message ID is required" },
        { status: 400 }
      );
    }

    await prisma.contactMessage.update({
      where: { id },
      data: { isDelete: true, updatedAt: moment().toDate() },
    });

    return NextResponse.json({ message: "Contact message deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact message:", error);
    return NextResponse.json(
      { error: "Failed to delete contact message" },
      { status: 500 }
    );
  }
}
