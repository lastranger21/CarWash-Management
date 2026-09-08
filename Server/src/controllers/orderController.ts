import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { OrderStatus } from '@prisma/client';
// 1. Buat Order Baru (Wireframe Screen 4)
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customerId, vehiclePlate, items } = req.body;
    const staffId = (req as any).user.id; // Dari middleware auth JWT
    // Cek Customer & Membership
    const customer = await prisma.customer.findUnique({
      where: { id: Number(customerId) },
      include: { membership: true }
    });
    if (!customer) {
      return res.status(404).json({ message: 'Customer tidak ditemukan' });
    }
    // Ambil harga asli layanan dari DB (Snapshot harga agar aman dari manipulasi)
    const serviceIds = items.map((i: any) => Number(i.serviceId));
    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds }, isActive: true }
    });
    let subtotal = 0;
    const orderItemsData = items.map((item: any) => {
      const service = services.find(s => s.id === Number(item.serviceId));
      if (!service) throw new Error(`Layanan ID ${item.serviceId} tidak valid`);
      const itemSubtotal = service.price * (item.quantity || 1);
      subtotal += itemSubtotal;
      return {
        serviceId: service.id,
        quantity: item.quantity || 1,
        priceSnapshot: service.price,
        subtotal: itemSubtotal
      };
    });
    // Hitung diskon member (PRD: discount = subtotal x membership discount)
    let discountPercent = 0;
    if (customer.membership && customer.membership.isActive) {
      discountPercent = Number(customer.membership.discountPercent);
    }
    const discountAmount = Math.round((subtotal * discountPercent) / 100);
    const total = subtotal - discountAmount;
    // Generate Order Code Unik (misal: CW-172578-001)
    const orderCode = `#CW-${Date.now().toString().slice(-4)}`;
    // Eksekusi Atomic Transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderCode,
          customerId: customer.id,
          vehiclePlate: vehiclePlate.toUpperCase(),
          createdById: staffId,
          status: 'QUEUED' as OrderStatus,
          paymentStatus: 'UNPAID',
          subtotal,
          discount: discountAmount,
          total,
          orderItems: {
            create: orderItemsData
          },
          histories: {
            create: {
              status: 'QUEUED' as OrderStatus,
              changedById: staffId,
              note: 'Order baru dibuat'
            }
          }
        },
        include: { orderItems: true, customer: true }
      });
      return order;
    });
    return res.status(201).json({
      message: 'Order car wash berhasil dibuat',
      data: newOrder
    });
  } catch (error) {
    next(error);
  }
};
// 2. Update Status 6-Stage dengan Validasi PRD
export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { nextStatus, note } = req.body;
    const staffId = (req as any).user.id;
    const order = await prisma.order.findUnique({
      where: { id: Number(id) }
    });
    if (!order) {
      return res.status(404).json({ message: 'Order tidak ditemukan' });
    }
    // VALIDASI ATURAN BISNIS PRD:
    // COMPLETED hanya diperbolehkan jika order READY dan paymentStatus = PAID
    if (nextStatus === 'COMPLETED') {
      if (order.status !== 'READY' as OrderStatus) {
        return res.status(400).json({ 
          message: 'Order belum READY! Harus melewati tahap READY sebelum COMPLETED.' 
        });
      }
      if (order.paymentStatus !== 'PAID') {
        return res.status(400).json({ 
          message: 'Tidak dapat menyelesaikan pesanan: Pembayaran belum lunas (UNPAID)!' 
        });
      }
    }
    // Update status dan simpan ke OrderStatusHistory
    const updated = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: Number(id) },
        data: { status: nextStatus }
      });
      await tx.orderStatusHistory.create({
        data: {
          orderId: Number(id),
          status: nextStatus,
          changedById: staffId,
          note: note || `Status diperbarui ke ${nextStatus}`
        }
      });
      return updatedOrder;
    });
    return res.status(200).json({
      message: `Status order berhasil diperbarui menjadi ${nextStatus}`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};


export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, status, paymentStatus } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const whereCondition: any = {};

    if (status && status !== 'ALL') {
      whereCondition.status = status;
    }

    if (paymentStatus && paymentStatus !== 'ALL') {
      whereCondition.paymentStatus = paymentStatus;
    }

    if (search) {
      whereCondition.OR = [
        { vehiclePlate: { contains: String(search), mode: 'insensitive' } },
        { customer: { name: { contains: String(search), mode: 'insensitive' } } },
        { orderCode: { contains: String(search), mode: 'insensitive' } },
      ];
    }
    
    const [orders, totalData] = await Promise.all([
      prisma.order.findMany({
        where: whereCondition,
        take: limit,
        skip: skip,
        orderBy: { createdAt: 'desc' }, // Order terbaru 
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
              membership: {
                select: { isActive: true, memberCode: true, discountPercent: true },
              },
            },
          },
          orderItems: {
            include: {
              service: { select: { id: true, name: true, price: true } },
            },
          },
          payment: true, // join table methode payment
        },
      }),
      prisma.order.count({ where: whereCondition }),
    ]);
    return res.status(200).json({
      message: 'Berhasil mengambil daftar pesanan car wash',
      meta: {
        currentPage: page,
        limit: limit,
        totalData: totalData,
        totalPage: Math.ceil(totalData / limit),
      },
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        customer: {
          include: {
            membership: true,
          },
        },
        orderItems: {
          include: {
            service: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        payment: {
          include: {
            receivedBy: {
              select: { id: true, name: true },
            },
          },
        },
        histories: {
          include: {
            changedBy: {
              select: { id: true, name: true },
            },
          },
          orderBy: { changedAt: 'asc' }, // Timeline alur dari awal sampai akhir
        },
      },
    });
    if (!order) {
      return res.status(404).json({
        message: `Pesanan dengan ID ${id} tidak ditemukan`,
      });
    }
    return res.status(200).json({
      message: 'Detail pesanan berhasil diambil',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
export const deleteOrder = async (req:Request, res: Response) => {
    try {
        const {id} = req.params
        await prisma.order.delete({
            where: {
                id: Number(id)
            }
        })
        return res.status(200).json({
            message: "order deleted successfully"
        })
    } catch (error) {
        return res.status(500).json({
            message: "Failed to delete order",
            error: error
        })
    }
}