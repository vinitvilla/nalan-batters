"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAdminApi } from "@/app/admin/use-admin-api";

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

const POLL_INTERVAL_MS = 300000; // 5 minutes

export function useNotifications() {
  const adminApiFetch = useAdminApi();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // Initial fetch + polling
  useEffect(() => {
    setLoading(true);
    fetchNotifications();

    intervalRef.current = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchNotifications]);

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

  return { notifications, unreadCount, loading, markAllRead, markOneRead, refetch: fetchNotifications };
}
