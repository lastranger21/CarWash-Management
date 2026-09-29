import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { OrderStatus, PayStatus } from '@prisma/client';

const snap = require('../services/midtransService');
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

export const createTransaction = async(req:Request, res:Response) => {
  try {
    const { orderId, amount, customerName, customerEmail } = req.body;
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: customerName,
        email: customerEmail,
      },
      
      // enabled_payments: ['gopay', 'bca_va', 'bni_va', 'bri_va', 'qris', 'shopeepay']
    };
    // Buat snap token dan redirect url
    const transaction = await snap.createTransaction(parameter);
    // Simpan token & redirect_url ke database
    await prisma.order.update({
      where: { id: orderId },
      data: {
        snapToken: transaction.token,
        snapRedirectUrl: transaction.redirect_url,
      },
    });
    return res.json({
      success: true,
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });
  } catch (error:any) {
    return res.status(500).json({ message: error.message });
  }
}
const crypto = require('crypto');
export const handleMidtransWebhook=async(req:Request, res:Response) => {
  try {
    const notificationJson = req.body;
    
    const { order_id, status_code, gross_amount, signature_key, transaction_status, payment_type,fraud_status  } = notificationJson;
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    
    const hash = crypto.createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest('hex');
    if (hash !== signature_key) {
      return res.status(403).json({ message: 'Invalid signature key' });
    }

    let paymentStatus = 'UNPAID';
    let orderStatus = 'PENDING';
    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      paymentStatus = 'SETTLEMENT';
      orderStatus = 'PAID';
    } else if (['deny', 'cancel', 'expire'].includes(transaction_status)) {
      paymentStatus = transaction_status.toUpperCase();
      orderStatus = 'CANCELLED';
    }
    // Update ke Database via Prisma
    const updatedOrder = await prisma.order.update({
      where: { id: order_id },
      data: {
        paymentStatus: paymentStatus as PayStatus,
        status: orderStatus as OrderStatus,
        paymentType: payment_type,
      },
    });
    //  Ambil instance Socket.IO dan pancarkan event ke room order yang bersangkutan
    const io = req.app.get('io');
    io.to(`order_${order_id}`).emit('payment_status_updated', {
      orderId: order_id,
      paymentStatus: updatedOrder.paymentStatus,
      status: updatedOrder.status,
      paymentType: updatedOrder.paymentType,
    });
    return res.status(200).json({ message: 'OK' });
  } catch (error:any) {
    return res.status(500).json({ message: error.message });
  }
}