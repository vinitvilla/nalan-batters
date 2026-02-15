import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, Truck, Package, XCircle } from "lucide-react";
import type { OrderStatus } from "@/generated/prisma";

/**
 * StatusBadge Component
 * Displays order status with appropriate color, icon, and label
 * Consolidates status badge logic used across admin pages
 */

interface StatusBadgeProps {
  status: OrderStatus | string;
  className?: string;
}

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  CONFIRMED: {
    label: "Confirmed",
    icon: CheckCircle2,
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  SHIPPED: {
    label: "Shipped",
    icon: Truck,
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  DELIVERED: {
    label: "Delivered",
    icon: Package,
    className: "bg-green-50 text-green-700 border-green-200",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-red-50 text-red-700 border-red-200",
  },
} as const;

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];

  if (!config) {
    return (
      <Badge variant="outline" className={className}>
        {status}
      </Badge>
    );
  }

  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.className} ${className}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
}
