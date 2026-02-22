"use client";

import React, { useState, useEffect, useCallback } from "react";
import moment from "moment";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { RequirePermission } from "@/components/PermissionWrapper";
import { useAdminApi } from "@/app/admin/use-admin-api";
import { formatPhoneNumber } from "@/lib/utils/commonFunctions";
import { EnhancedPagination } from "@/components/ui/enhanced-pagination";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Receipt,
  DollarSign,
  Package,
  RefreshCw,
  CreditCard,
  Banknote,
  Search,
  ShoppingCart,
  Eye,
  Clock,
  TrendingUp,
  Hash,
  X,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: { name: string };
}

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  tax: number;
  discount: number | null;
  status: string;
  orderType: string;
  paymentMethod: string;
  createdAt: string;
  user: { fullName: string; phone: string };
  items: OrderItem[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const statusColor = (status: string) => {
  switch (status) {
    case "COMPLETED":
    case "DELIVERED":
    case "CONFIRMED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "PENDING":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "CANCELLED":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const paymentIcon = (method: string) =>
  method === "CASH" ? (
    <Banknote className="h-3.5 w-3.5 text-emerald-600" />
  ) : (
    <CreditCard className="h-3.5 w-3.5 text-blue-600" />
  );

// ─── Component ───────────────────────────────────────────────────────────────

export default function PosOrdersPage() {
  const adminApiFetch = useAdminApi();

  // Data
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // Detail dialog
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Stats (derived from API pagination total)
  const [stats, setStats] = useState({
    totalOrders: 0,
    todayOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
  });

  // ── Fetch orders ──────────────────────────────────────────────────────────

  const fetchOrders = useCallback(
    async (page: number) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: page.toString(),
          limit: itemsPerPage.toString(),
        });
        if (debouncedSearch) params.append("search", debouncedSearch);
        if (statusFilter !== "all") params.append("status", statusFilter);
        if (paymentFilter !== "all")
          params.append("paymentMethod", paymentFilter);

        const response = await adminApiFetch(
          `/api/admin/pos/orders?${params}`
        );
        if (!response) throw new Error("No response from server");

        const result = await response.json();
        if (!result.success) throw new Error(result.error || "Fetch failed");

        setOrders(result.data);
        setTotalPages(result.pagination.totalPages);
        setTotalItems(result.pagination.total);

        // Compute stats from current page data
        const today = moment().startOf("day");
        const todayOrders = result.data.filter((o: Order) =>
          moment(o.createdAt).startOf("day").isSame(today)
        );
        const revenue = result.data.reduce(
          (s: number, o: Order) => s + o.total,
          0
        );
        setStats({
          totalOrders: result.pagination.total,
          todayOrders: todayOrders.length,
          totalRevenue: revenue,
          avgOrderValue:
            result.data.length > 0 ? revenue / result.data.length : 0,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Network error while fetching"
        );
        console.error("POS orders fetch error:", err);
      } finally {
        setLoading(false);
      }
    },
    [adminApiFetch, itemsPerPage, debouncedSearch, statusFilter, paymentFilter]
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, paymentFilter]);

  // Fetch on page / filter change
  useEffect(() => {
    fetchOrders(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage, debouncedSearch, statusFilter, paymentFilter]);

  const hasActiveFilters =
    search !== "" || statusFilter !== "all" || paymentFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPaymentFilter("all");
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <RequirePermission permission="billing">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              POS Orders
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Point-of-sale transactions and walk-in orders
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => (window.location.href = "/admin/billing-pos")}
              className="bg-gray-900 hover:bg-gray-800 text-white font-semibold shadow-sm cursor-pointer"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              New Sale
            </Button>
            <Button
              variant="outline"
              onClick={() => fetchOrders(currentPage)}
              className="border-gray-300 cursor-pointer"
            >
              <RefreshCw className="h-4 w-4 mr-1.5" />
              Refresh
            </Button>
          </div>
        </div>

        {/* ── Compact Stats ──────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3">
          {[
            {
              label: "Total",
              value: stats.totalOrders,
              icon: <Hash className="h-3.5 w-3.5" />,
            },
            {
              label: "Today",
              value: stats.todayOrders,
              icon: <Clock className="h-3.5 w-3.5" />,
            },
            {
              label: "Revenue",
              value: `$${stats.totalRevenue.toFixed(2)}`,
              icon: <DollarSign className="h-3.5 w-3.5" />,
            },
            {
              label: "Avg",
              value: `$${stats.avgOrderValue.toFixed(2)}`,
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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search order # or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 bg-gray-50 border-gray-200 focus:border-gray-400 focus:ring-gray-400"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-36 h-10 bg-gray-50 border-gray-200">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-full sm:w-36 h-10 bg-gray-50 border-gray-200">
              <SelectValue placeholder="All Payments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="CASH">Cash</SelectItem>
              <SelectItem value="CARD">Card</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
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
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <Receipt className="h-10 w-10 text-gray-300 mb-3" />
              <p className="text-gray-600 font-medium mb-1">
                Failed to load orders
              </p>
              <p className="text-gray-400 text-sm mb-4">{error}</p>
              <Button
                onClick={() => fetchOrders(currentPage)}
                className="bg-gray-900 hover:bg-gray-800 text-white cursor-pointer"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <Receipt className="h-10 w-10 text-gray-300 mb-3" />
              <p className="text-gray-600 font-medium mb-1">
                {hasActiveFilters ? "No matching orders" : "No POS orders yet"}
              </p>
              <p className="text-gray-400 text-sm mb-4">
                {hasActiveFilters
                  ? "Try adjusting your filters"
                  : "Orders will appear here when customers make in-store purchases"}
              </p>
              {hasActiveFilters ? (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="cursor-pointer"
                >
                  Clear Filters
                </Button>
              ) : (
                <Button
                  onClick={() =>
                    (window.location.href = "/admin/billing-pos")
                  }
                  className="bg-gray-900 hover:bg-gray-800 text-white cursor-pointer"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Start New Sale
                </Button>
              )}
            </div>
          ) : (
            <div className={`overflow-x-auto ${loading ? "opacity-60" : ""}`}>
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="border-b bg-gray-50/80">
                    <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wider py-3 px-4">
                      Order
                    </TableHead>
                    <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wider py-3 px-4">
                      Customer
                    </TableHead>
                    <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wider py-3 px-4">
                      Date / Time
                    </TableHead>
                    <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wider py-3 px-4">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wider py-3 px-4">
                      Payment
                    </TableHead>
                    <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wider py-3 px-4">
                      Items
                    </TableHead>
                    <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wider py-3 px-4 text-right">
                      Total
                    </TableHead>
                    <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wider py-3 px-4 text-center w-20">
                      {/* Actions */}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order, idx) => (
                    <TableRow
                      key={order.id}
                      className={`border-b border-gray-100 hover:bg-blue-50/40 transition-colors cursor-pointer ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                        }`}
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsDialogOpen(true);
                      }}
                    >
                      {/* Order # */}
                      <TableCell className="py-3.5 px-4">
                        <span className="font-mono text-sm font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                          {order.orderNumber}
                        </span>
                      </TableCell>

                      {/* Customer */}
                      <TableCell className="py-3.5 px-4">
                        <div className="text-sm font-medium text-gray-900">
                          {order.user.fullName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatPhoneNumber(order.user.phone)}
                        </div>
                      </TableCell>

                      {/* Date / Time */}
                      <TableCell className="py-3.5 px-4">
                        <div className="text-sm text-gray-900">
                          {moment(order.createdAt).format("MMM D")}
                        </div>
                        <div className="text-xs text-gray-500">
                          {moment(order.createdAt).format("h:mm A")}
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-3.5 px-4">
                        <Badge
                          className={`text-xs font-semibold px-2 py-0.5 border ${statusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>

                      {/* Payment */}
                      <TableCell className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-700">
                          {paymentIcon(order.paymentMethod)}
                          <span className="font-medium">
                            {order.paymentMethod}
                          </span>
                        </div>
                      </TableCell>

                      {/* Items */}
                      <TableCell className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <Package className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-700">
                            {order.items.length} item
                            {order.items.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 max-w-40 truncate">
                          {order.items
                            .map((i) => i.product.name)
                            .join(", ")}
                        </div>
                      </TableCell>

                      {/* Total */}
                      <TableCell className="py-3.5 px-4 text-right">
                        <div className="font-bold text-gray-900">
                          ${order.total.toFixed(2)}
                        </div>
                        {order.discount && order.discount > 0 && (
                          <div className="text-xs text-emerald-600 font-medium">
                            -${order.discount.toFixed(2)} saved
                          </div>
                        )}
                      </TableCell>

                      {/* Action */}
                      <TableCell
                        className="py-3.5 px-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 text-gray-500 hover:text-gray-900 cursor-pointer"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsDialogOpen(true);
                          }}
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
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(n) => {
                  setItemsPerPage(n);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}
        </div>

        {/* ── Order Details Dialog ────────────────────────────────────── */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Receipt className="h-5 w-5 text-gray-700" />
                Order #{selectedOrder?.orderNumber}
              </DialogTitle>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-5 pt-2">
                {/* Info grid */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs uppercase tracking-wide">
                      Customer
                    </span>
                    <p className="font-medium text-gray-900 mt-0.5">
                      {selectedOrder.user.fullName}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs uppercase tracking-wide">
                      Phone
                    </span>
                    <p className="font-medium text-gray-900 mt-0.5">
                      {formatPhoneNumber(selectedOrder.user.phone)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs uppercase tracking-wide">
                      Date
                    </span>
                    <p className="font-medium text-gray-900 mt-0.5">
                      {moment(selectedOrder.createdAt).format(
                        "MMM D, YYYY · h:mm A"
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs uppercase tracking-wide">
                      Payment
                    </span>
                    <p className="font-medium text-gray-900 mt-0.5 flex items-center gap-1.5">
                      {paymentIcon(selectedOrder.paymentMethod)}
                      {selectedOrder.paymentMethod}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs uppercase tracking-wide">
                      Status
                    </span>
                    <div className="mt-1">
                      <Badge
                        className={`text-xs font-semibold px-2 py-0.5 border ${statusColor(
                          selectedOrder.status
                        )}`}
                      >
                        {selectedOrder.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Items */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                    <Package className="h-4 w-4 text-gray-500" />
                    Items ({selectedOrder.items.length})
                  </h4>
                  <div className="space-y-1.5">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg text-sm"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 bg-gray-200 rounded text-xs font-bold flex items-center justify-center text-gray-700">
                            {item.quantity}
                          </span>
                          <span className="font-medium text-gray-900">
                            {item.product.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-gray-900">
                            $
                            {(
                              item.quantity *
                              parseFloat(item.price.toString())
                            ).toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-400 ml-1.5">
                            @ ${parseFloat(item.price.toString()).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Summary */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>
                      $
                      {(
                        selectedOrder.total -
                        selectedOrder.tax +
                        (selectedOrder.discount || 0)
                      ).toFixed(2)}
                    </span>
                  </div>
                  {selectedOrder.discount &&
                    selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Discount</span>
                        <span>
                          -${selectedOrder.discount.toFixed(2)}
                        </span>
                      </div>
                    )}
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>${selectedOrder.tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-base text-gray-900">
                    <span>Total</span>
                    <span>${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </RequirePermission>
  );
}
