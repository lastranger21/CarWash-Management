import { Router } from "express";
import { getServiceById,getAllService,createService,updateService,deleteService } from "../controllers/serviceController";
import { createServiceSchema } from "../validations/serviceSchema";
import { authentication } from "../middlewares/authMiddleware";
import { authorizeRole } from "../middlewares/authorizeRole";
import { upload } from "../lib/multer";
import { validate } from "../middlewares/validate";
const router = Router()


router.post("/",authentication, authorizeRole(["ADMIN"]),upload.single('image'),validate(createServiceSchema),createService)
router.get("/",authentication, getAllService)
router.get("/:id",getServiceById)
router.put("/:id",authentication, authorizeRole(["ADMIN"]),upload.single('image'),updateService)
router.delete("/:id",authentication, authorizeRole(["ADMIN"]),deleteService)
export default router;