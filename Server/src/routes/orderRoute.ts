// src/routes/orderRoute.ts
import { Router } from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from '../controllers/orderController';
import { authentication } from '../middlewares/authMiddleware';
import { authorizeRole } from '../middlewares/authorizeRole';
import { validate } from '../middlewares/validate';
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from '../validations/orderSchema';

const router = Router();


router.use(authentication);


router.post(
  '/',
  authorizeRole(['ADMIN', 'STAFF']),
  validate(createOrderSchema),
  createOrder
);


router.get(
  '/',
  authorizeRole(['ADMIN', 'STAFF']),
  getAllOrders
);


router.get(
  '/:id',
  authorizeRole(['ADMIN', 'STAFF']),
  getOrderById
);

// 4. Update Status Pengerjaan (RECEIVED -> QUEUED -> WASHING -> DRYING -> READY -> COMPLETED)
router.patch(
  '/:id/status',
  authorizeRole(['ADMIN', 'STAFF']),
  validate(updateOrderStatusSchema),
  updateOrderStatus
);


router.delete(
  '/:id',
  authorizeRole(['ADMIN']),
  deleteOrder
);

export default router;