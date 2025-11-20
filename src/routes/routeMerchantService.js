import {Router} from "express";
import {getIsServiceSuspended} from "../controller/MerchantServiceController.js";

const router = Router();

router.post("/get-service-suspended", getIsServiceSuspended)

export default router;