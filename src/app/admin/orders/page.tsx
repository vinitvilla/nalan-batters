"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { userStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import { useAdminApi } from "@/app/admin/use-admin-api";
import { AdminOrderResponse } from "@/types/order";
import { ORDER_STATUSES } from "@/constants/order";
import type { OrderStatus } from "@/generated/prisma";
import {
  Package,
  Phone,
  Truck,
  Clock,
  MapPin,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  RefreshCw,
  X,
  Hash,
  Receipt,
  DollarSign,
  TrendingUp,
  Eye,
} from "lucide-react";
import {
  capitalize,
  formatCurrency,
  formatPhoneNumber,
  formatDate,
  formatDateOnly,
} from "@/lib/utils/commonFunctions";
import { DateFilter } from "@/components/ui/date-filter";
import { EnhancedPagination } from "@/components/ui/enhanced-pagination";
import { useOrderFilters } from "@/hooks/useOrderFilters";
import moment from "moment";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const statusColor = (status: string) => {
  switch (status) {
    case "DELIVERED":
    case "CONFIRMED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "SHIPPED":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "PENDING":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "CANCELLED":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrderResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const token = userStore((s) => s.token);
  const adminApiFetch = useAdminApi();
  const router = useRouter();

  const {
    filters,
    pagination,
    setSearch,
    setStatus,
    setOrderType,
    setPaymentMethod,
    setDateFilter,
    handleSort,
    handlePageChange,
    handleItemsPerPageChange,
    resetFilters,
    buildQueryParams,
    setTotalPages,
    setTotalItems,
  } = useOrderFilters();

  // ── Fetch orders ──────────────────────────────────────────────────────────

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    try {
      const params = buildQueryParams();
      const response = await adminApiFetch(
        `/api/admin/orders?${params.toString()}`
      );
      if (!response) throw new Error("No response from server");

      const data = await response.json();

      if (data.orders && data.pagination) {
        const mapped = data.orders.map((order: AdminOrderResponse) => ({
          ...order,
          fullName: order.user?.fullName || "",
          phone: order.user?.phone || "",
        }));
        setOrders(mapped);
        setTotalPages(data.pagination.totalPages);
        setTotalItems(data.pagination.totalCount);
      } else {
        const fallback = (
          Array.isArray(data) ? data : data.orders || []
        ).map((order: AdminOrderResponse) => ({
          ...order,
          fullName: order.user?.fullName || "",
          phone: order.user?.phone || "",
        }));
        setOrders(fallback);
        setTotalPages(Math.ceil(fallback.length / pagination.itemsPerPage));
        setTotalItems(fallback.length);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [
    token,
    buildQueryParams,
    adminApiFetch,
    pagination.itemsPerPage,
    setTotalPages,
    setTotalItems,
  ]);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    token,
    pagination.currentPage,
    pagination.itemsPerPage,
    filters.debouncedSearch,
    filters.status,
    filters.orderType,
    filters.paymentMethod,
    filters.dateFilter,
    filters.sortBy,
    filters.sortOrder,
  ]);

  // ── Status update ─────────────────────────────────────────────────────────

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (!token) return;
    setUpdatingStatus(orderId);

    try {
      const res = await adminApiFetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus.toUpperCase() }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!res || !res.ok) {
        const errorData = await res?.json?.();
        throw new Error(
          errorData?.message || "Failed to update order status"
        );
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, status: newStatus.toUpperCase() as OrderStatus }
            : order
        )
      );
      toast.success("Order status updated successfully");
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update status"
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  // ── Sort icon ─────────────────────────────────────────────────────────────

  const getSortIcon = (column: string) => {
    if (filters.sortBy !== column)
      return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />;
    return filters.sortOrder === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-gray-700" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-gray-700" />
    );
  };

  const hasActiveFilters =
    filters.search !== "" ||
    filters.status !== "all" ||
    filters.orderType !== "all" ||
    filters.paymentMethod !== "all" ||
    filters.dateFilter.quickFilter !== "all" ||
    filters.dateFilter.startDate !== "" ||
    filters.dateFilter.endDate !== "";

  // ── Stats (derived from current page data) ────────────────────────────────

  const today = moment().startOf("day");
  const todayCount = orders.filter((o) =>
    moment(o.createdAt).startOf("day").isSame(today)
  ).length;
  const revenue = orders.reduce((s, o) => s + Number(o.total), 0);
  const avgOrder = orders.length > 0 ? revenue / orders.length : 0;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Orders
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Manage and track all customer orders
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchOrders}
          className="border-gray-300 cursor-pointer"
        >
          <RefreshCw className="h-4 w-4 mr-1.5" />
          Refresh
        </Button>
      </div>

      {/* ── Compact Stats ──────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        {[
          {
            label: "Total",
            value: pagination.totalItems,
            icon: <Hash className="h-3.5 w-3.5" />,
          },
          {
            label: "Today",
            value: todayCount,
            icon: <Clock className="h-3.5 w-3.5" />,
          },
          {
            label: "Revenue",
            value: `$${revenue.toFixed(2)}`,
            icon: <DollarSign className="h-3.5 w-3.5" />,
          },
          {
            label: "Avg",
            value: `$${avgOrder.toFixed(2)}`,
            icon: <TrendingUp className="h-3.5 w-3.5" />,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm shadow-sm"
          >
            <span className="text-gray-400">{s.icon}</span>
            <span className="text-gray-500 font-medium">{s.label}</span>
            <span className="font-bold text-gray-900">{s.value}</span>
          </div>
        ))}
      </div>

      {/* ── Filter Toolbar ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search customer, phone, or order #..."
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-gray-50 border-gray-200 focus:border-gray-400 focus:ring-gray-400"
          />
        </div>

        <Select value={filters.status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-36 h-10 bg-gray-50 border-gray-200">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="SHIPPED">Shipped</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.orderType} onValueChange={setOrderType}>
          <SelectTrigger className="w-full sm:w-36 h-10 bg-gray-50 border-gray-200">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="delivery">Delivery</SelectItem>
            <SelectItem value="pickup">Pickup</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger className="w-full sm:w-36 h-10 bg-gray-50 border-gray-200">
            <SelectValue placeholder="All Payments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="card">Card</SelectItem>
          </SelectContent>
        </Select>

        <DateFilter
          dateFilter={filters.dateFilter}
          onDateFilterChange={setDateFilter}
          className="h-10"
        />

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-gray-500 hover:text-gray-700 cursor-pointer h-10"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* ── Table ───────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading && orders.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Loading orders...</p>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <Receipt className="h-10 w-10 text-gray-300 mb-3" />
            <p className="text-gray-600 font-medium mb-1">
              {hasActiveFilters ? "No matching orders" : "No orders yet"}
            </p>
            <p className="text-gray-400 text-sm mb-4">
              {hasActiveFilters
                ? "Try adjusting your filters"
                : "Orders will appear here when customers place them"}
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={resetFilters}
                className="cursor-pointer"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className={`overflow-x-auto ${loading ? "opacity-60" : ""}`}>
            <Table className="min-w-[960px]">
              <TableHeader>
                <TableRow className="border-b bg-gray-50/80">
                  {(
                    [
                      { label: "Order #", col: "orderNumber", right: false },
                      { label: "Customer", col: "user.fullName", right: false },
                      { label: "Status", col: "status", right: false },
                      { label: "Type", col: "orderType", right: false },
                      { label: "Amount", col: "total", right: true },
                      { label: "Order Date", col: "createdAt", right: false },
                      { label: "Delivery", col: "deliveryDate", right: false },
                    ] as Array<{ label: string; col: string; right: boolean }>
                  ).map(({ label, col, right }) => (
                    <TableHead
                      key={col}
                      className={`py-3 px-4 ${right ? "text-right" : ""}`}
                    >
                      <button
                        onClick={() => handleSort(col)}
                        className="flex items-center gap-1 font-semibold text-gray-600 text-xs uppercase tracking-wider hover:text-gray-900 transition-colors cursor-pointer"
                        style={right ? { marginLeft: "auto" } : {}}
                      >
                        {label}
                        {getSortIcon(col)}
                      </button>
                    </TableHead>
                  ))}
                  <TableHead className="py-3 px-4 text-center w-16">
                    {/* View */}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order, idx) => (
                  <TableRow
                    key={order.id}
                    className={`border-b border-gray-100 hover:bg-blue-50/40 transition-colors cursor-pointer ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                    }`}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (
                        target.closest('[role="combobox"]') ||
                        target.closest('[role="option"]') ||
                        target.closest(".select-trigger") ||
                        target.closest("[data-radix-menu-trigger]")
                      )
                        return;
                      router.push(`/admin/orders/${order.id}`);
                    }}
                  >
                    {/* Order # */}
                    <TableCell className="py-3.5 px-4">
                      <span className="font-mono text-sm font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                        #{order.orderNumber || "N/A"}
                      </span>
                    </TableCell>

                    {/* Customer */}
                    <TableCell className="py-3.5 px-4">
                      <div className="text-sm font-medium text-gray-900">
                        {order.user.fullName}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        {formatPhoneNumber(order.user.phone)}
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell
                      className="py-3.5 px-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Select
                        value={order.status}
                        onValueChange={(newStatus) =>
                          handleStatusChange(order.id, newStatus)
                        }
                        disabled={updatingStatus === order.id}
                      >
                        <SelectTrigger
                          className={`w-28 h-7 select-trigger text-xs font-semibold border ${statusColor(order.status)}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ORDER_STATUSES.map((s) => (
                            <SelectItem key={s} value={s} className="text-xs">
                              {capitalize(s)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>

                    {/* Type */}
                    <TableCell className="py-3.5 px-4">
                      <Badge
                        className={`text-xs font-semibold px-2 py-0.5 border ${
                          order.deliveryType === "DELIVERY"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {order.deliveryType === "DELIVERY" ? (
                          <Truck className="w-3 h-3 mr-1" />
                        ) : (
                          <Package className="w-3 h-3 mr-1" />
                        )}
                        {capitalize(order.deliveryType || "N/A")}
                      </Badge>
                    </TableCell>

                    {/* Amount */}
                    <TableCell className="py-3.5 px-4 text-right">
                      <div className="font-bold text-gray-900">
                        {formatCurrency(order.total)}
                      </div>
                      {Number(order.discount) > 0 && (
                        <div className="text-xs text-emerald-600 font-medium">
                          -{formatCurrency(Number(order.discount))} saved
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        {capitalize(order.paymentMethod || "N/A")}
                      </div>
                    </TableCell>

                    {/* Order Date */}
                    <TableCell className="py-3.5 px-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(order.createdAt)}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {moment(order.createdAt).format("h:mm A")}
                      </div>
                    </TableCell>

                    {/* Delivery */}
                    <TableCell className="py-3.5 px-4">
                      {order.deliveryDate ? (
                        <>
                          <div className="text-sm text-gray-900">
                            {formatDateOnly(order.deliveryDate)}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {order.address?.city || "N/A"}
                          </div>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          Not scheduled
                        </span>
                      )}
                    </TableCell>

                    {/* View */}
                    <TableCell
                      className="py-3.5 px-4 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2.5 text-gray-500 hover:text-gray-900 cursor-pointer"
                        onClick={() =>
                          router.push(`/admin/orders/${order.id}`)
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {orders.length > 0 && (
          <div className="px-4 pb-2">
            <EnhancedPagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              itemsPerPage={pagination.itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
