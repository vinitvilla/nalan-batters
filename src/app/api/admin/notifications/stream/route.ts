import { NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase/firebase-admin";
import { prisma } from "@/lib/prisma";
import { addClient, removeClient } from "@/lib/notification-emitter";

/**
 * GET /api/admin/notifications/stream
 *
 * Server-Sent Events endpoint for real-time notifications.
 *
 * EventSource does not support custom headers, so the Firebase ID token
 * is passed as a `?token=` query parameter (safe over HTTPS; tokens
 * are short-lived and this is a read-only endpoint).
 */
export async function GET(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────
  const token = new URL(req.url).searchParams.get("token");
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  let decoded: Awaited<ReturnType<typeof adminAuth.verifyIdToken>>;
  try {
    decoded = await adminAuth.verifyIdToken(token);
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }

  // Resolve DB user and verify ADMIN / MANAGER role
  const phoneNumber = decoded.phone_number;
  const isAdminClaim = decoded.admin === true;

  const user = phoneNumber
    ? await prisma.user.findFirst({
        where: { phone: phoneNumber, isDelete: false },
        select: { id: true, role: true },
      })
    : null;

  const isAuthorised =
    isAdminClaim ||
    user?.role === "ADMIN" ||
    user?.role === "MANAGER";

  if (!user || !isAuthorised) {
    return new Response("Forbidden", { status: 403 });
  }

  const userId = user.id;

  // ── SSE stream ────────────────────────────────────────────────────────
  const encoder = new TextEncoder();
  let heartbeat: ReturnType<typeof setInterval>;
  let _controller: ReadableStreamDefaultController<Uint8Array>;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      _controller = controller;
      addClient(userId, controller);

      // Confirm connection to the client
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`)
      );

      // Heartbeat every 30 s — keeps the connection alive through proxies / load-balancers
      heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          clearInterval(heartbeat);
          removeClient(userId, controller);
        }
      }, 30_000);

      // Clean up when the client disconnects
      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        removeClient(userId, controller);
        try {
          controller.close();
        } catch {
          // already closed — ignore
        }
      });
    },
    cancel() {
      clearInterval(heartbeat);
      removeClient(userId, _controller);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      // Prevent nginx / Vercel Edge from buffering the stream
      "X-Accel-Buffering": "no",
    },
  });
}
