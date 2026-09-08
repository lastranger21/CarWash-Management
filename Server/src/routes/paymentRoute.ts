import { Router } from 'express';
import { 
  createPayment, 
  getPaymentByOrderId, 
  getAllPayments 
} from '../controllers/paymentController';
import { authentication } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', authentication, createPayment);
router.get('/', authentication, getAllPayments);
router.get('/order/:orderId', authentication, getPaymentByOrderId);

export default router;