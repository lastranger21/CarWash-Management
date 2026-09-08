import { Router } from 'express';
import { toggleMembership,createCustomer,updateCustomer,getAllCustomer,getCustomerById } from '../controllers/customerController';
import { authentication } from '../middlewares/authMiddleware'; 

const router = Router();

router.post('/',createCustomer)
router.get('/',getAllCustomer)
router.put('/:id',updateCustomer)
router.get('/:id',getCustomerById)
router.patch('/:id/membership', authentication, toggleMembership);

export default router;