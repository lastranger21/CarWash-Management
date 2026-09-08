import { Router } from "express";
import userRoute from "./userRoute";
import serviceRoute from "./serviceRoute"
import authRoute from "./authRoute"
import customer from "./customerRoute"
import payment from "./paymentRoute"
const router = Router()
router.use('/profile',userRoute);
router.use('/service',serviceRoute)
router.use('/auth',authRoute)
router.use('/customers',customer)
router.use('/payments',payment)
export default router;