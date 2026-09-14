// file: Server/src/controllers/bayController.ts
import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { OrderStatus } from '@prisma/client';
// 1. Ambil Semua Bay Beserta Mobil yang Sedang Ada di Bilik
export const getAllBays = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // A. Cek apakah tabel Bay masih kosong
    const count = await prisma.bay.count();
    if (count === 0) {
      await prisma.bay.createMany({
        data: [
          { name: 'Bay 1 (Cuci Salju)', status: true },
          { name: 'Bay 2 (Cuci Salju)', status: true },
          { name: 'Bay 3 (Pengeringan)', status: true },
          { name: 'Bay 4 (Detailing)', status: true },
        ],
      });
    }
    // B. Ambil data bay (hanya 1 query pasti, type-safe, tidak ada error tipe)
    const bays = await prisma.bay.findMany({
      include: {
        orders: {
          where: {
            status: { notIn: [OrderStatus.COMPLETED, OrderStatus.CANCELLED] },
          },
          include: {
            customer: true,
            orderItems: {
              include: { service: true },
            },
          },
        },
      },
      orderBy: { id: 'asc' },
    });
    return res.status(200).json({
      message: 'Berhasil mengambil data bay',
      data: bays,
    });
  } catch (error) {
    next(error);
  }
};

// Tambah Bay Baru 
export const createBay = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, status } = req.body;
    const newBay = await prisma.bay.create({
      data: {
        name,
        status: status !== undefined ? Boolean(status) : true,
      },
    });

    return res.status(201).json({
      message: 'Bilik bay baru berhasil dibuat!',
      data: newBay,
    });
  } catch (error) {
    next(error);
  }
};

//  Update Status Bay 
export const updateBay = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    const updatedBay = await prisma.bay.update({
      where: { id: Number(id) },
      data: {
        ...(name ? { name } : {}),
        ...(status !== undefined ? { status: Boolean(status) } : {}),
      },
    });

    return res.status(200).json({
      message: 'Status bilik bay berhasil diperbarui',
      data: updatedBay,
    });
  } catch (error) {
    next(error);
  }
};