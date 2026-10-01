import { Router } from 'express';
import { 
  createPayment, 
  getPaymentByOrderId, 
  getAllPayments ,createTransaction,handleMidtransWebhook
} from '../controllers/paymentController';
import { authentication } from '../middlewares/authMiddleware';

const router = Router();

router.post('/notification',handleMidtransWebhook)
router.post('/', authentication, createPayment);
router.get('/', authentication, getAllPayments);
router.get('/order/:orderId', authentication, getPaymentByOrderId);
router.post('/create', authentication, createTransaction);

export default router;