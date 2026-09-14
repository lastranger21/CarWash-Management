// src/routes/orderRoute.ts
import { Router } from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  updateOrder
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
router.put(
  '/:id',
  authorizeRole(['ADMIN', 'STAFF']),
  updateOrder
);

//  Update Status Pengerjaan (RECEIVED -> QUEUED -> WASHING -> DRYING -> READY -> COMPLETED)
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