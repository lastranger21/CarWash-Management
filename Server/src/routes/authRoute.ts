import { Router } from "express";
import { register, login, registerCustomer } from "../controllers/authController";
import { authentication } from "../middlewares/authMiddleware";
import { authorizeRole } from "../middlewares/authorizeRole";
const router = Router()

router.post("/register", authentication, authorizeRole(["ADMIN"]), register)
router.post("/customer/register", registerCustomer)
router.post("/login", login)

export default router
