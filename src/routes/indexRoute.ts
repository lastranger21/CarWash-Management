import { Router } from "express";
import userRoute from "./userRoute";
import serviceRoute from "./serviceRoute"
import authRoute from "./authRoute"
const router = Router()
router.use('/profile',userRoute);
router.use('/service',serviceRoute)
router.use('/auth',authRoute)

export default router;