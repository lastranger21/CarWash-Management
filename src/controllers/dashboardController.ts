// src/controllers/dashboardController.ts
import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export const getDashboardSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // set waktu operasional
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // agregasi dengan promise all
    const [
      queuedCount,
      washingCount,
      readyCount,
      unpaidCount,
      todayRevenueAggregate,
      recentOrders,
      statusBreakdown
    ] = await Promise.all([
      // A. Antrean: Order dengan status QUEUED atau RECEIVED
      prisma.order.count({
        where: {
          status: { in: ['QUEUED', 'RECEIVED'] as any },
        },
      }),

      // B. Sedang Dicuci: Order dengan status WASHING atau DRYING
      prisma.order.count({
        where: {
          status: { in: ['WASHING', 'DRYING'] as any },
        },
      }),

      // C. Ready: Order yang sudah siap diserahkan ke pelanggan
      prisma.order.count({
        where: {
          status: 'READY' as any,
        },
      }),

      // D. Unpaid: Semua order yang belum lunas
      prisma.order.count({
        where: {
          paymentStatus: 'UNPAID',
        },
      }),

      // total revenue
      prisma.payment.aggregate({
        _sum: {
          amount: true,
        }
      }),

      // latest order
      prisma.order.findMany({
        take: 6,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          orderCode: true,
          vehiclePlate: true,
          status: true,
          paymentStatus: true,
          total: true,
          createdAt: true,
          customer: {
            select: {
              name: true,
              phone: true,
              membership: {
                select: {
                  isActive: true,
                  discountPercent: true,
                },
              },
            },
          },
          orderItems: {
            select: {
              quantity: true,
              service: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),

      // visualisasi status
      prisma.order.groupBy({
        by: ['status'],
        _count: {
          id: true,
        },
      }),
    ]);

    // Format data status breakdown menjadi object key-value sederhana
    const pipelineCounts = statusBreakdown.reduce((acc, curr) => {
      acc[curr.status] = curr._count.id;
      return acc;
    }, {} as Record<string, number>);

    return res.status(200).json({
      message: 'Dashboard summary fetched successfully',
      data: {
        
        metrics: {
          queued: queuedCount,
          washing: washingCount,
          ready: readyCount,
          unpaid: unpaidCount,
          todayRevenue: todayRevenueAggregate._sum.amount || 0,
        },
        pipeline: {
          RECEIVED: pipelineCounts['RECEIVED'] || 0,
          QUEUED: pipelineCounts['QUEUED'] || 0,
          WASHING: pipelineCounts['WASHING'] || 0,
          DRYING: pipelineCounts['DRYING'] || 0,
          READY: pipelineCounts['READY'] || 0,
          COMPLETED: pipelineCounts['COMPLETED'] || 0,
        },
        recentOrders: recentOrders.map((order) => ({
          id: order.id,
          orderCode: order.orderCode,
          vehiclePlate: order.vehiclePlate,
          customerName: order.customer.name,
          isMember: order.customer.membership?.isActive || false,
          services: order.orderItems.map((item) => item.service.name),
          status: order.status,
          paymentStatus: order.paymentStatus,
          total: order.total,
          createdAt: order.createdAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};