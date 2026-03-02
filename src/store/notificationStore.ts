import { create } from "zustand";

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

interface NotificationStoreState {
  notifications: AdminNotification[];
  unreadCount: number;
  loading: boolean;
  initialized: boolean;

  // Actions
  setNotifications: (notifications: AdminNotification[]) => void;
  setUnreadCount: (count: number) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  addNotification: (notification: AdminNotification) => void;
  markOneReadLocal: (id: string) => void;
  markAllReadLocal: () => void;
}

export const useNotificationStore = create<NotificationStoreState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  initialized: false,

  setNotifications: (notifications) => set({ notifications }),
  setUnreadCount: (count) => set({ unreadCount: count }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),

  addNotification: (notification) => {
    const { notifications } = get();
    if (notifications.some((n) => n.id === notification.id)) return;
    set({
      notifications: [notification, ...notifications].slice(0, 10),
      unreadCount: get().unreadCount + 1,
    });
  },

  markOneReadLocal: (id) => {
    const current = get();
    const target = current.notifications.find((n) => n.id === id);
    if (!target || target.isRead) return; // already read — skip
    set({
      notifications: current.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, current.unreadCount - 1),
    });
  },

  markAllReadLocal: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },
}));
