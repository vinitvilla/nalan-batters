"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAdminApi } from "@/app/admin/use-admin-api";
import { userStore } from "@/store/userStore";

export interface AdminNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  isRead: boolean;
  link: string;
  isDelete: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: AdminNotification[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function useNotifications() {
  const adminApiFetch = useAdminApi();
  const token = userStore((s) => s.token);

  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  // ── Initial load ───────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await adminApiFetch("/api/admin/notifications?page=1&limit=10");
      if (!res || !res.ok) return;
      const data: NotificationsResponse = await res.json();
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      // Silently fail — notifications are non-critical
    } finally {
      setLoading(false);
    }
  }, [adminApiFetch]);

  useEffect(() => {
    setLoading(true);
    fetchNotifications();
  }, [fetchNotifications]);

  // ── SSE real-time connection ───────────────────────────────────────────
  // EventSource does not support custom headers, so the Firebase token is
  // forwarded as a query parameter (safe over HTTPS; token is short-lived).
  useEffect(() => {
    if (!token) return;

    const es = new EventSource(
      `/api/admin/notifications/stream?token=${encodeURIComponent(token)}`
    );
    esRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string);

        if (data.type === "new_notification") {
          const incoming: AdminNotification = data.notification;

          setNotifications((prev) => {
            // Guard against duplicates (e.g. caused by SSE reconnects)
            if (prev.some((n) => n.id === incoming.id)) return prev;
            // Keep at most 10 entries (matching the initial page size)
            return [incoming, ...prev].slice(0, 10);
          });

          setUnreadCount((prev) => prev + 1);
        }
      } catch {
        // Malformed event — ignore
      }
    };

    // EventSource automatically reconnects on error — no action needed
    es.onerror = () => {};

    return () => {
      es.close();
    };
  }, [token]);

  const markAllRead = useCallback(async () => {
    try {
      const res = await adminApiFetch("/api/admin/notifications", { method: "PATCH" });
      if (!res || !res.ok) return;
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  }, [adminApiFetch]);

  const markOneRead = useCallback(
    async (id: string) => {
      try {
        const res = await adminApiFetch(`/api/admin/notifications/${id}`, {
          method: "PATCH",
        });
        if (!res || !res.ok) return;
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // ignore
      }
    },
    [adminApiFetch]
  );

  return {
    notifications,
    unreadCount,
    loading,
    markAllRead,
    markOneRead,
    refetch: fetchNotifications,
  };
}
