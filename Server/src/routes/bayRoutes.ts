import { authentication } from "../middlewares/authMiddleware";
import { authorizeRole } from "../middlewares/authorizeRole";
import { Router } from 'express';
import { createBay,getAllBays,updateBay } from "../controllers/BayController";

const router = Router();
router.post('/',authentication,authorizeRole(["ADMIN"]),createBay)
router.get('/',getAllBays)
router.put('/:id',authentication,authorizeRole(["ADMIN"]),updateBay)
export default router;