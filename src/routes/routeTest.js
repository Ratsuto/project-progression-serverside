import {Router} from "express";
import {getMerchantByValue} from "../controller/testController.js";


const router = Router();

router.post("/get-service-by-merchant", getMerchantByValue)

export default router;
