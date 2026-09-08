import { Router } from 'express';
import { toggleMembership } from '../controllers/customerController';
import { authentication } from '../middlewares/authMiddleware'; 

const router = Router();


router.patch('/:id/membership', authentication, toggleMembership);

export default router;