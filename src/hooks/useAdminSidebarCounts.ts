"use client";

import { useCallback } from "react";
import { useNotifications } from "@/hooks/useNotifications";

const ORDER_LINK_PREFIX = "/admin/orders/";
const MESSAGES_LINK_PREFIX = "/admin/contact-messages/";

/**
 * Derives per-section unread notification counts for the admin sidebar.
 * Uses the same useNotifications hook (SSE + initial REST fetch) — no extra calls.
 *
 * ordersCount   — unread notifications whose link starts with /admin/orders/
 * messagesCount — unread notifications whose link starts with /admin/contact-messages/
 * markSectionRead(prefix) — marks all unread notifications for a section as read
 */
export function useAdminSidebarCounts() {
  const { notifications, markOneRead } = useNotifications();

  const ordersCount = notifications.filter(
    (n) => !n.isRead && n.link.startsWith(ORDER_LINK_PREFIX)
  ).length;

  const messagesCount = notifications.filter(
    (n) => !n.isRead && n.link.startsWith(MESSAGES_LINK_PREFIX)
  ).length;

  const markSectionRead = useCallback(
    async (prefix: string) => {
      const toMark = notifications.filter(
        (n) => !n.isRead && n.link.startsWith(prefix)
      );
      await Promise.all(toMark.map((n) => markOneRead(n.id)));
    },
    [notifications, markOneRead]
  );

  return {
    ordersCount,
    messagesCount,
    markSectionRead,
    ORDER_LINK_PREFIX,
    MESSAGES_LINK_PREFIX,
  };
}
