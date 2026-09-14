import { Router } from "express";
import { register, login } from "../controllers/authController";
import { authentication } from "../middlewares/authMiddleware";
import { authorizeRole } from "../middlewares/authorizeRole";
const router = Router()

router.post("/register", authentication, authorizeRole(["ADMIN"]),register)
router.post("/login", login)

export default router
