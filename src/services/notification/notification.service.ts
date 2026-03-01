import { prisma } from "@/lib/prisma";

/**
 * Creates a "New Order" notification for every ADMIN and MANAGER user.
 * Called fire-and-forget after a public order is successfully created.
 */
export async function createOrderNotifications(order: {
  id: string;
  orderNumber: string;
}) {
  const admins = await prisma.user.findMany({
    where: {
      role: { in: ["ADMIN", "MANAGER"] },
      isDelete: false,
    },
    select: { id: true },
  });

  if (admins.length === 0) return;

  await prisma.notification.createMany({
    data: admins.map((admin) => ({
      userId: admin.id,
      title: `New Order #${order.orderNumber}`,
      body: "A new online order has been placed.",
      link: `/admin/orders/${order.id}`,
    })),
  });
}

/**
 * Returns paginated notifications for a user (excluding soft-deleted).
 */
export async function getNotifications(
  userId: string,
  page: number = 1,
  limit: number = 10
) {
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId, isDelete: false },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where: { userId, isDelete: false } }),
    prisma.notification.count({ where: { userId, isRead: false, isDelete: false } }),
  ]);

  return {
    notifications,
    unreadCount,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Returns the count of unread notifications for a user.
 */
export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { userId, isRead: false, isDelete: false },
  });
}

/**
 * Marks all unread notifications as read for a user.
 */
export async function markAllAsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, isRead: false, isDelete: false },
    data: { isRead: true },
  });
}

/**
 * Marks a single notification as read (scoped to the user for safety).
 */
export async function markOneAsRead(id: string, userId: string) {
  await prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });
}

/**
 * Soft-deletes a single notification (scoped to the user for safety).
 */
export async function softDeleteOne(id: string, userId: string) {
  await prisma.notification.updateMany({
    where: { id, userId },
    data: { isDelete: true },
  });
}
