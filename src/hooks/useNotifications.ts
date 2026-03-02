"use client";

import { useEffect, useCallback } from "react";
import { useAdminApi } from "@/app/admin/use-admin-api";
import { userStore } from "@/store/userStore";
import {
  useNotificationStore,
  type AdminNotification,
} from "@/store/notificationStore";

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

export type { AdminNotification };

/**
 * Module-level SSE reference — ensures only one EventSource connection
 * exists across all component instances that call useNotifications().
 */
let activeEventSource: EventSource | null = null;
let activeToken: string | null = null;

export function useNotifications() {
  const adminApiFetch = useAdminApi();
  const token = userStore((s) => s.token);

  // Read from shared Zustand store (reactive — re-renders on change)
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const loading = useNotificationStore((s) => s.loading);
  const initialized = useNotificationStore((s) => s.initialized);

  const store = useNotificationStore.getState;

  // ── Initial load (runs only once across all consumers) ─────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await adminApiFetch("/api/admin/notifications?page=1&limit=10");
      if (!res || !res.ok) return;
      const data: NotificationsResponse = await res.json();
      store().setNotifications(data.notifications ?? []);
      store().setUnreadCount(data.unreadCount ?? 0);
    } catch {
      // Silently fail — notifications are non-critical
    } finally {
      store().setLoading(false);
    }
  }, [adminApiFetch, store]);

  useEffect(() => {
    if (initialized) return;
    store().setInitialized(true);
    store().setLoading(true);
    fetchNotifications();
  }, [initialized, fetchNotifications, store]);

  // ── SSE real-time connection (single global connection) ────────────────
  useEffect(() => {
    if (!token) return;

    // Reuse existing connection if token hasn't changed
    if (activeEventSource && activeToken === token) return;

    // Close stale connection if token changed
    if (activeEventSource) {
      activeEventSource.close();
      activeEventSource = null;
    }

    activeToken = token;
    const es = new EventSource(
      `/api/admin/notifications/stream?token=${encodeURIComponent(token)}`
    );
    activeEventSource = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string);
        if (data.type === "new_notification") {
          store().addNotification(data.notification);
        }
      } catch {
        // Malformed event — ignore
      }
    };

    es.onerror = () => { };

    return () => {
      es.close();
      if (activeEventSource === es) {
        activeEventSource = null;
        activeToken = null;
      }
    };
  }, [token, store]);

  // ── API actions (call API + update shared store) ───────────────────────
  const markAllRead = useCallback(async () => {
    try {
      const res = await adminApiFetch("/api/admin/notifications", { method: "PATCH" });
      if (!res || !res.ok) return;
      store().markAllReadLocal();
    } catch {
      // ignore
    }
  }, [adminApiFetch, store]);

  const markOneRead = useCallback(
    async (id: string) => {
      // Optimistic: update store immediately
      store().markOneReadLocal(id);
      try {
        const res = await adminApiFetch(`/api/admin/notifications/${id}`, {
          method: "PATCH",
        });
        if (!res || !res.ok) {
          // Could revert here, but non-critical
        }
      } catch {
        // ignore
      }
    },
    [adminApiFetch, store]
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
