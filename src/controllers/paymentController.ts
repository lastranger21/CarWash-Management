import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export const createPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId, amount, method } = req.body;
    const staffId = (req as any).user.id; // Diambil dari middleware auth JWT (req.user)
    // Validasi input awal
    if (!orderId || !amount || !method) {
      return res.status(400).json({
        message: 'Field orderId, amount, dan method wajib diisi',
      });
    }
    // Cek keberadaan Order
    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
    });
    if (!order) {
      return res.status(404).json({ message: 'Order tidak ditemukan' });
    }
    // mencegah bayar 2 kali 
    if (order.paymentStatus === 'PAID') {
      return res.status(400).json({
        message: 'Order ini sudah lunas (PAID)!',
      });
    }
    // tidak boleh  bayar kurang
    const totalDue = order.total;
    const amountPaid = Number(amount);
    if (amountPaid < totalDue) {
      return res.status(400).json({
        message: `Nominal pembayaran kurang! Total tagihan: Rp ${totalDue.toLocaleString('id-ID')}, uang diterima: Rp ${amountPaid.toLocaleString('id-ID')}`,
      });
    }
    const change = amountPaid - totalDue; 
    const result = await prisma.$transaction(async (tx) => {
      
      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          amount: amountPaid,
          method: method.toUpperCase(), 
          receivedById: staffId,
          paidAt: new Date(),
        },
        include: {
          receivedBy: {
            select: { id: true, name: true, email: true },
          },
        },
      });
      
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'PAID' },
      });
      return { payment, updatedOrder };
    });
    return res.status(201).json({
      message: 'Pembayaran berhasil diproses dan dicatat!',
      data: {
        paymentId: result.payment.id,
        orderCode: result.updatedOrder.orderCode,
        totalBill: totalDue,
        amountPaid: amountPaid,
        change: change,
        method: result.payment.method,
        paidAt: result.payment.paidAt,
        receivedBy: result.payment.receivedBy.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

// cetak invoice
export const getPaymentByOrderId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const payment = await prisma.payment.findUnique({
      where: { orderId: Number(orderId) },
      include: {
        receivedBy: {
          select: { id: true, name: true },
        },
        order: {
          include: {
            customer: true,
            orderItems: {
              include: { service: true },
            },
          },
        },
      },
    });
    if (!payment) {
      return res.status(404).json({
        message: 'Data pembayaran untuk order ini belum ditemukan',
      });
    }
    return res.status(200).json({
      message: 'Data pembayaran berhasil diambil',
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPayments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        receivedBy: { select: { id: true, name: true } },
        order: {
          select: {
            orderCode: true,
            vehiclePlate: true,
            total: true,
            customer: { select: { name: true } },
          },
        },
      },
      orderBy: { paidAt: 'desc' },
    });
    return res.status(200).json({
      message: 'Daftar transaksi pembayaran berhasil diambil',
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};