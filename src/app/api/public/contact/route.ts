import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ContactStatus } from "@/generated/prisma";
import { logError, logInfo, logWarn } from "@/lib/logger";
import { createContactMessageNotifications } from "@/services/notification/notification.service";

export async function POST(req: NextRequest) {
  try {
    const { name, mobile, message } = await req.json();

    // Validate required fields
    if (!name || !mobile || !message) {
      return NextResponse.json(
        { error: "Name, mobile number, and message are required" },
        { status: 400 }
      );
    }

    // Validate mobile format (basic validation for mobile numbers)
    const mobileRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!mobileRegex.test(mobile.replace(/[\s\-\(\)]/g, ''))) {
      logWarn(req.logger, { action: 'invalid_mobile_format', mobile });
      return NextResponse.json(
        { error: "Please provide a valid mobile number" },
        { status: 400 }
      );
    }

    // Save contact message to database
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        mobile: mobile.trim(),
        message: message.trim(),
        status: ContactStatus.NEW,
      },
    });

    logInfo(req.logger, { action: 'contact_message_created', messageId: contactMessage.id, name: name.trim() });

    // Fire-and-forget: notify all admins/managers via SSE
    void createContactMessageNotifications({ id: contactMessage.id, name: name.trim() });


    return NextResponse.json(
      {
        success: true,
        message: "Thank you for your message! We'll get back to you within 24 hours.",
        id: contactMessage.id,
      },
      { status: 201 }
    );

  } catch (error) {
    logError(req.logger, error, { action: 'contact_message_create_failed' });
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}
