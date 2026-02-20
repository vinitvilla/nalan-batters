import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET(req: NextRequest) {
  try {
    const adminCheck = await requireAdmin(req);
    if (adminCheck instanceof NextResponse) return adminCheck;
    // Get current date ranges
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    // 1. Total Users
    const totalUsers = await prisma.user.count({
      where: { isDelete: false }
    });

    // 2. Total Orders
    const totalOrders = await prisma.order.count({
      where: { isDelete: false }
    });

    // 3. Today's Orders
    const todaysOrders = await prisma.order.count({
      where: {
        isDelete: false,
        createdAt: {
          gte: startOfToday
        }
      }
    });

    // 4. This Month's Revenue
    const monthlyRevenue = await prisma.order.aggregate({
      where: {
        isDelete: false,
        createdAt: {
          gte: startOfMonth
        },
        status: { in: ['DELIVERED'] }
      },
      _sum: {
        total: true
      }
    });

    // 5. Last Month's Revenue (for comparison)
    const lastMonthRevenue = await prisma.order.aggregate({
      where: {
        isDelete: false,
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth
        },
        status: { in: ['DELIVERED'] }
      },
      _sum: {
        total: true
      }
    });

    // 6. Active Products
    const activeProducts = await prisma.product.count({
      where: {
        isActive: true,
        isDelete: false
      }
    });

    // 7. Low Stock Products
    const lowStockProducts = await prisma.product.count({
      where: {
        isActive: true,
        isDelete: false,
        stock: {
          lt: 5
        }
      }
    });

    // 8. Order Status Distribution
    const orderStatusDistribution = await prisma.order.groupBy({
      by: ['status'],
      where: {
        isDelete: false,
        createdAt: {
          gte: startOfMonth
        }
      },
      _count: {
        _all: true
      }
    });

    // 9. Order Type Distribution (Pickup vs Delivery)
    const orderTypeDistribution = await prisma.order.groupBy({
      by: ['orderType'],
      where: {
        isDelete: false,
        createdAt: {
          gte: startOfMonth
        }
      },
      _count: {
        _all: true
      }
    });

    // 10. Top Products (by order count)
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          isDelete: false,
          createdAt: {
            gte: startOfMonth
          }
        }
      },
      _sum: {
        quantity: true
      },
      _count: {
        _all: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5
    });

    // 11. Daily Revenue Trend (Last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        label: date.toLocaleDateString('en-US', { weekday: 'short' })
      };
    });

    const dailyRevenue = await Promise.all(
      last7Days.map(async ({ date, label }) => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const revenue = await prisma.order.aggregate({
          where: {
            isDelete: false,
            status: 'DELIVERED',
            createdAt: {
              gte: date,
              lt: nextDay
            }
          },
          _sum: {
            total: true
          }
        });

        return {
          label,
          revenue: Number(revenue._sum?.total || 0)
        };
      })
    );

    // 12. Hourly Order Distribution (Today)
    const hourlyOrders = Array.from({ length: 24 }, (_, hour) => {
      return {
        hour: hour.toString().padStart(2, '0') + ':00',
        count: 0
      };
    });

    const todaysOrdersByHour = await prisma.order.findMany({
      where: {
        isDelete: false,
        createdAt: {
          gte: startOfToday
        }
      },
      select: {
        createdAt: true
      }
    });

    todaysOrdersByHour.forEach(order => {
      const hour = order.createdAt.getHours();
      hourlyOrders[hour].count++;
    });

    // 13. Monthly Order Trends (Last 6 months)
    const monthlyTrends = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return {
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        startDate: new Date(date.getFullYear(), date.getMonth(), 1),
        endDate: new Date(date.getFullYear(), date.getMonth() + 1, 0)
      };
    });

    const monthlyOrderData = await Promise.all(
      monthlyTrends.map(async ({ month, startDate, endDate }) => {
        const orders = await prisma.order.count({
          where: {
            isDelete: false,
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          }
        });

        const revenue = await prisma.order.aggregate({
          where: {
            isDelete: false,
            status: 'DELIVERED',
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          },
          _sum: {
            total: true
          }
        });

        return {
          month,
          orders,
          revenue: Number(revenue._sum?.total || 0)
        };
      })
    );

    // 14. Product Category Sales (single query instead of N+1)
    const categorySalesRaw = await prisma.orderItem.findMany({
      where: {
        order: {
          isDelete: false,
          status: 'DELIVERED',
          createdAt: { gte: startOfMonth }
        }
      },
      select: {
        quantity: true,
        product: {
          select: {
            category: { select: { name: true } }
          }
        }
      }
    });

    const categoryAggregated = categorySalesRaw.reduce((acc, item) => {
      const categoryName = item.product.category.name || 'Unknown';
      acc[categoryName] = (acc[categoryName] || 0) + item.quantity;
      return acc;
    }, {} as Record<string, number>);

    const categoryChartData = Object.entries(categoryAggregated).map(([name, quantity]) => ({
      name,
      quantity
    }));

    // Get product details for top products
    const productIds = topProducts.map(p => p.productId);
    const productDetails = await prisma.product.findMany({
      where: {
        id: { in: productIds }
      },
      select: {
        id: true,
        name: true,
        price: true
      }
    });

    // Calculate revenue growth percentage
    const currentRevenue = monthlyRevenue._sum?.total || 0;
    const lastRevenue = lastMonthRevenue._sum?.total || 0;
    const revenueGrowth = Number(lastRevenue) > 0
      ? ((Number(currentRevenue) - Number(lastRevenue)) / Number(lastRevenue) * 100).toFixed(1)
      : 0;

    return NextResponse.json({
      overview: {
        totalUsers,
        totalOrders,
        todaysOrders,
        monthlyRevenue: Number(currentRevenue),
        revenueGrowth: Number(revenueGrowth),
        activeProducts,
        lowStockProducts
      },
      charts: {
        orderStatus: orderStatusDistribution.map(item => ({
          status: item.status,
          count: item._count._all
        })),
        orderType: orderTypeDistribution.map(item => ({
          type: item.orderType,
          count: item._count._all
        })),
        topProducts: topProducts.map(item => {
          const product = productDetails.find(p => p.id === item.productId);
          return {
            productId: item.productId,
            name: product?.name || 'Unknown',
            quantity: item._sum.quantity || 0,
            orderCount: item._count._all
          };
        }),
        dailyRevenue,
        hourlyOrders: hourlyOrders.filter(h => h.count > 0),
        monthlyTrends: monthlyOrderData,
        categoryDistribution: categoryChartData
      }
    });

  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
