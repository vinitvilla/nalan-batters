"use client";
import React, { useState, useEffect } from "react";
import { Bar, Pie, Doughnut, Line, Radar, PolarArea } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    LineElement,
    PointElement,
    RadialLinearScale,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { useAdminApi } from "../use-admin-api";
import { toast } from "sonner";

// Register chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    LineElement,
    PointElement,
    RadialLinearScale,
    Tooltip,
    Legend,
    Filler
);

interface DashboardData {
    overview: {
        totalUsers: number;
        totalOrders: number;
        todaysOrders: number;
        monthlyRevenue: number;
        revenueGrowth: number;
        activeProducts: number;
        lowStockProducts: number;
    };
    charts: {
        orderStatus: Array<{ status: string; count: number }>;
        orderType: Array<{ type: string; count: number }>;
        topProducts: Array<{
            productId: string;
            name: string;
            quantity: number;
            orderCount: number
        }>;
        dailyRevenue: Array<{ label: string; revenue: number }>;
        hourlyOrders: Array<{ hour: string; count: number }>;
        monthlyTrends: Array<{ month: string; orders: number; revenue: number }>;
        categoryDistribution: Array<{ name: string; quantity: number }>;
        lowStockProducts: Array<{ id: string; name: string; stock: number }>;
    };
}

export default function DashboardPage() {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const adminApiFetch = useAdminApi();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await adminApiFetch('/api/admin/dashboard');
            if (!response) {
                throw new Error("Failed to fetch dashboard data");
            }
            const data = await response.json();
            setDashboardData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            toast.error("Failed to fetch dashboard data");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-xl sm:text-2xl font-bold">Admin Dashboard</h1>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-gray-500">Loading dashboard data...</div>
                </div>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="space-y-6">
                <h1 className="text-xl sm:text-2xl font-bold">Admin Dashboard</h1>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700">Error: {error || 'Failed to load data'}</p>
                    <button
                        onClick={fetchDashboardData}
                        className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Prepare chart data
    const orderStatusData = {
        labels: dashboardData.charts.orderStatus.map(item => item.status),
        datasets: [{
            label: "Orders by Status",
            data: dashboardData.charts.orderStatus.map(item => item.count),
            backgroundColor: [
                "#f59e0b", // PENDING
                "#10b981", // CONFIRMED  
                "#3b82f6", // SHIPPED
                "#059669", // DELIVERED
                "#ef4444", // CANCELLED
            ],
            borderWidth: 2,
            borderColor: "#ffffff",
        }],
    };

    const orderTypeData = {
        labels: dashboardData.charts.orderType.map(item => item.type),
        datasets: [{
            label: "Orders by Type",
            data: dashboardData.charts.orderType.map(item => item.count),
            backgroundColor: ["#6366f1", "#f59e0b"],
            borderWidth: 3,
            borderColor: "#ffffff",
        }],
    };

    const topProductsData = {
        labels: dashboardData.charts.topProducts.map(item => item.name),
        datasets: [{
            label: "Quantity Sold",
            data: dashboardData.charts.topProducts.map(item => item.quantity),
            backgroundColor: "rgba(16, 185, 129, 0.8)",
            borderColor: "#10b981",
            borderWidth: 2,
            borderRadius: 8,
        }],
    };

    // Daily Revenue Trend Line Chart
    const dailyRevenueData = {
        labels: dashboardData.charts.dailyRevenue.map(item => item.label),
        datasets: [{
            label: "Daily Revenue ($)",
            data: dashboardData.charts.dailyRevenue.map(item => item.revenue),
            fill: true,
            backgroundColor: "rgba(99, 102, 241, 0.1)",
            borderColor: "#6366f1",
            borderWidth: 3,
            pointBackgroundColor: "#6366f1",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
            pointRadius: 6,
            tension: 0.4,
        }],
    };

    // Monthly Trends (Line Chart)
    const monthlyTrendsData = {
        labels: dashboardData.charts.monthlyTrends.map(item => item.month),
        datasets: [
            {
                label: "Orders",
                data: dashboardData.charts.monthlyTrends.map(item => item.orders),
                borderColor: "#f59e0b",
                backgroundColor: "rgba(245, 158, 11, 0.1)",
                borderWidth: 3,
                fill: false,
                tension: 0.3,
                yAxisID: 'y',
                pointBackgroundColor: "#f59e0b",
                pointBorderColor: "#ffffff",
                pointBorderWidth: 2,
                pointRadius: 5,
            },
            {
                label: "Revenue ($)",
                data: dashboardData.charts.monthlyTrends.map(item => item.revenue),
                borderColor: "#ef4444",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                borderWidth: 3,
                fill: false,
                tension: 0.3,
                yAxisID: 'y1',
                pointBackgroundColor: "#ef4444",
                pointBorderColor: "#ffffff",
                pointBorderWidth: 2,
                pointRadius: 5,
            }
        ],
    };

    // Hourly Orders Radar Chart
    const hourlyOrdersData = {
        labels: dashboardData.charts.hourlyOrders.map(item => item.hour),
        datasets: [{
            label: "Orders by Hour",
            data: dashboardData.charts.hourlyOrders.map(item => item.count),
            backgroundColor: "rgba(168, 85, 247, 0.2)",
            borderColor: "#a855f7",
            borderWidth: 2,
            pointBackgroundColor: "#a855f7",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 1,
        }],
    };

    // Category Distribution Polar Area
    const categoryData = {
        labels: dashboardData.charts.categoryDistribution.map(item => item.name),
        datasets: [{
            label: "Sales by Category",
            data: dashboardData.charts.categoryDistribution.map(item => item.quantity),
            backgroundColor: [
                "rgba(99, 102, 241, 0.8)",
                "rgba(245, 158, 11, 0.8)",
                "rgba(16, 185, 129, 0.8)",
                "rgba(239, 68, 68, 0.8)",
                "rgba(168, 85, 247, 0.8)",
            ],
            borderWidth: 2,
            borderColor: "#ffffff",
        }],
    };

    // Low Stock Products Chart
    const lowStockData = {
        labels: dashboardData.charts.lowStockProducts.map(item => item.name),
        datasets: [{
            label: "Current Stock",
            data: dashboardData.charts.lowStockProducts.map(item => item.stock),
            backgroundColor: dashboardData.charts.lowStockProducts.map(item => {
                if (item.stock <= 2) return "rgba(239, 68, 68, 0.85)";
                if (item.stock <= 5) return "rgba(245, 158, 11, 0.85)";
                return "rgba(234, 179, 8, 0.85)";
            }),
            borderColor: dashboardData.charts.lowStockProducts.map(item => {
                if (item.stock <= 2) return "#dc2626";
                if (item.stock <= 5) return "#d97706";
                return "#ca8a04";
            }),
            borderWidth: 2,
            borderRadius: 6,
        }],
    };
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="space-y-6 p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            Nalan Batters Analytics
                        </h1>
                        <p className="text-gray-600 mt-1 text-sm sm:text-base">Real-time business insights and performance metrics</p>
                    </div>
                    <button
                        onClick={fetchDashboardData}
                        className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>

                {/* Enhanced Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-gray-800 to-black rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-gray-300 mb-2">Total Users</h3>
                                <p className="text-3xl font-bold">{dashboardData.overview.totalUsers}</p>
                                <p className="text-sm text-gray-400 mt-1">Registered customers</p>
                            </div>
                            <div className="bg-white/10 rounded-lg p-3">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-gray-300 mb-2">Total Orders</h3>
                                <p className="text-3xl font-bold">{dashboardData.overview.totalOrders}</p>
                                <p className="text-sm text-gray-400 mt-1">Today: {dashboardData.overview.todaysOrders}</p>
                            </div>
                            <div className="bg-white/10 rounded-lg p-3">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-gray-300 mb-2">Monthly Revenue</h3>
                                <p className="text-3xl font-bold">${dashboardData.overview.monthlyRevenue.toLocaleString()}</p>
                                <p className={`text-sm mt-1 ${dashboardData.overview.revenueGrowth >= 0 ? 'text-gray-300' : 'text-gray-400'}`}>
                                    {dashboardData.overview.revenueGrowth >= 0 ? '+' : ''}{dashboardData.overview.revenueGrowth}% from last month
                                </p>
                            </div>
                            <div className="bg-white/10 rounded-lg p-3">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-500 to-gray-700 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-gray-300 mb-2">Products</h3>
                                <p className="text-3xl font-bold">{dashboardData.overview.activeProducts}</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    {dashboardData.overview.lowStockProducts} low stock
                                </p>
                            </div>
                            <div className="bg-white/10 rounded-lg p-3">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    {/* Order Status Distribution */}
                    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">Order Status</h2>
                            <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
                        </div>
                        <div className="h-64 sm:h-80">
                            <Doughnut
                                data={orderStatusData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'bottom',
                                            labels: {
                                                padding: 20,
                                                usePointStyle: true,
                                                font: { size: 12 }
                                            }
                                        }
                                    },
                                    cutout: '60%',
                                }}
                            />
                        </div>
                    </div>

                    {/* Pickup vs Delivery */}
                    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">Order Types</h2>
                            <div className="w-3 h-3 bg-gray-700 rounded-full"></div>
                        </div>
                        <div className="h-64 sm:h-80">
                            <Pie
                                data={orderTypeData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'bottom',
                                            labels: {
                                                padding: 20,
                                                usePointStyle: true,
                                                font: { size: 12 }
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">Top Products</h2>
                            <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                        </div>
                        <div className="h-64 sm:h-80">
                            <Bar
                                data={topProductsData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false }
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            ticks: { stepSize: 1 },
                                            grid: { color: 'rgba(0,0,0,0.1)' }
                                        },
                                        x: {
                                            grid: { display: false }
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Daily Revenue Trend */}
                    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-100 lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">Daily Revenue Trend (Last 7 Days)</h2>
                            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                        </div>
                        <div className="h-64 sm:h-80">
                            <Line
                                data={dailyRevenueData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false },
                                        tooltip: {
                                            backgroundColor: 'rgba(0,0,0,0.8)',
                                            titleColor: '#fff',
                                            bodyColor: '#fff',
                                        }
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            grid: { color: 'rgba(0,0,0,0.1)' },
                                            ticks: {
                                                callback: function (value) {
                                                    return '$' + value;
                                                }
                                            }
                                        },
                                        x: {
                                            grid: { display: false }
                                        }
                                    },
                                    elements: {
                                        point: {
                                            hoverRadius: 8
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Monthly Trends */}
                    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-100 lg:col-span-2 xl:col-span-1">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">Monthly Trends</h2>
                            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        </div>
                        <div className="h-64 sm:h-80">
                            <Line
                                data={monthlyTrendsData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    interaction: {
                                        mode: 'index' as const,
                                        intersect: false,
                                    },
                                    scales: {
                                        y: {
                                            type: 'linear' as const,
                                            display: true,
                                            position: 'left' as const,
                                            title: {
                                                display: true,
                                                text: 'Orders'
                                            }
                                        },
                                        y1: {
                                            type: 'linear' as const,
                                            display: true,
                                            position: 'right' as const,
                                            title: {
                                                display: true,
                                                text: 'Revenue ($)'
                                            },
                                            grid: {
                                                drawOnChartArea: false,
                                            },
                                        },
                                    },
                                    plugins: {
                                        legend: {
                                            position: 'bottom' as const,
                                            labels: {
                                                usePointStyle: true
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Additional Advanced Charts */}
                {(dashboardData.charts.hourlyOrders.length > 0 || dashboardData.charts.categoryDistribution.length > 0) && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                        {/* Hourly Orders Distribution */}
                        {dashboardData.charts.hourlyOrders.length > 0 && (
                            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-800">Today&apos;s Hourly Orders</h2>
                                    <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                                </div>
                                <div className="h-64 sm:h-80">
                                    <Radar
                                        data={hourlyOrdersData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: { display: false }
                                            },
                                            scales: {
                                                r: {
                                                    beginAtZero: true,
                                                    ticks: { stepSize: 1 }
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Category Distribution */}
                        {dashboardData.charts.categoryDistribution.length > 0 && (
                            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-800">Sales by Category</h2>
                                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                                </div>
                                <div className="h-64 sm:h-80">
                                    <PolarArea
                                        data={categoryData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: {
                                                    position: 'bottom',
                                                    labels: {
                                                        usePointStyle: true,
                                                        padding: 20
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Low Stock Products Chart */}
                {dashboardData.charts.lowStockProducts.length > 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">Low Stock Products</h2>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
                                {dashboardData.charts.lowStockProducts.length} items
                            </span>
                        </div>
                        <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                                <span className="w-3 h-3 rounded-sm bg-red-500 inline-block"></span> Critical (≤2)
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-3 h-3 rounded-sm bg-orange-500 inline-block"></span> Low (≤5)
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-3 h-3 rounded-sm bg-yellow-500 inline-block"></span> Warning (≤10)
                            </span>
                        </div>
                        <div style={{ height: Math.max(200, dashboardData.charts.lowStockProducts.length * 50) }}>
                            <Bar
                                data={lowStockData}
                                options={{
                                    indexAxis: 'y' as const,
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false },
                                        tooltip: {
                                            backgroundColor: 'rgba(0,0,0,0.8)',
                                            callbacks: {
                                                label: function (context) {
                                                    const stock = context.raw as number;
                                                    const severity = stock <= 2 ? '🔴 Critical' : stock <= 5 ? '🟠 Low' : '🟡 Warning';
                                                    return `Stock: ${stock} units — ${severity}`;
                                                }
                                            }
                                        }
                                    },
                                    scales: {
                                        x: {
                                            beginAtZero: true,
                                            max: 12,
                                            ticks: { stepSize: 2 },
                                            grid: { color: 'rgba(0,0,0,0.05)' },
                                            title: {
                                                display: true,
                                                text: 'Stock Level',
                                                font: { size: 12 }
                                            }
                                        },
                                        y: {
                                            grid: { display: false },
                                            ticks: {
                                                font: { size: 12, weight: 'bold' as const }
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Additional Info */}
                {dashboardData.charts.topProducts.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                        <h2 className="text-lg font-semibold mb-4">Top Selling Products This Month</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Product Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Quantity Sold
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Orders
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {dashboardData.charts.topProducts.map((product, index) => (
                                        <tr key={product.productId}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                #{index + 1} {product.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {product.quantity}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {product.orderCount}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
