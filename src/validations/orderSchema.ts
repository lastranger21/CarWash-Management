// src/validations/orderSchema.ts
import { z } from 'zod';

// Skema Validasi untuk Buat Order Baru (Screen 4 PRD)
export const createOrderSchema = z.object({
  customerId: z.coerce.number(
  ).positive('Customer ID tidak valid'),

  vehiclePlate: z
    .string()
    .trim()
    .min(3, 'Plat nomor minimal 3 karakter')
    .max(15, 'Plat nomor maksimal 15 karakter'),

  items: z
    .array(
      z.object({
        serviceId: z.coerce.number().positive('Service ID tidak valid'),
        quantity: z.coerce.number().min(1, 'Jumlah minimal 1').default(1),
      })
    )
    .min(1, 'Minimal pilih 1 layanan cuci'),
});

// Skema Validasi untuk Update Status (6-Stage Workflow PRD)
export const updateOrderStatusSchema = z.object({
  nextStatus: z.enum([
    'RECEIVED',
    'QUEUED',
    'WASHING',
    'DRYING',
    'READY',
    'COMPLETED',
    'CANCELLED',
  ]),
  note: z.string().optional(),
});