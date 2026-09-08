import { Router } from "express";
import userRoute from "./userRoute";
import serviceRoute from "./serviceRoute"
import authRoute from "./authRoute"
import customer from "./customerRoute"
import payment from "./paymentRoute"
import dashboard from "./dashboardRoute"
import order from "./orderRoute"
const router = Router()
router.use('/profile',userRoute);
router.use('/service',serviceRoute)
router.use('/auth',authRoute)
router.use('/customers',customer)
router.use('/payments',payment)
router.use('/dashboard',dashboard)
router.use('/order',order )
export default router;