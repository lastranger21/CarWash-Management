// src/routes/dashboardRoute.ts
import { Router } from 'express';
import { getDashboardSummary } from '../controllers/dashboardController';
import { authentication} from '../middlewares/authMiddleware';
import { authorizeRole } from '../middlewares/authorizeRole';

const router = Router();

// Endpoint dashboard diproteksi auth JWT (Staff & Admin)
router.get('/summary', authentication,authorizeRole(["ADMIN"]), getDashboardSummary);

export default router;