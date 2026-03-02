"use client";

import { useCallback, useMemo } from "react";
import { useNotifications } from "@/hooks/useNotifications";

const ORDER_LINK_PREFIX = "/admin/orders/";

/**
 * Returns the set of order IDs that have unread notifications,
 * plus a helper to mark one order's notification as read.
 *
 * Used by the orders list page to highlight unread rows and
 * by the order detail page to mark-as-read on mount.
 */
export function useUnreadOrderIds() {
  const { notifications, markOneRead } = useNotifications();

  /** Set of order IDs extracted from unread notification links */
  const unreadOrderIds = useMemo(() => {
    const ids = new Set<string>();
    for (const n of notifications) {
      if (!n.isRead && n.link.startsWith(ORDER_LINK_PREFIX)) {
        const orderId = n.link.slice(ORDER_LINK_PREFIX.length);
        if (orderId) ids.add(orderId);
      }
    }
    return ids;
  }, [notifications]);

  /** Mark all notifications for a given order ID as read */
  const markOrderRead = useCallback(
    async (orderId: string) => {
      const toMark = notifications.filter(
        (n) =>
          !n.isRead &&
          n.link === `${ORDER_LINK_PREFIX}${orderId}`
      );
      await Promise.all(toMark.map((n) => markOneRead(n.id)));
    },
    [notifications, markOneRead]
  );

  return { unreadOrderIds, markOrderRead };
}
