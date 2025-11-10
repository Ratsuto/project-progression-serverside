import {Router} from "express";
import {getUserDetail, getRoleDetail} from "../controller/UserDetailController.js";

const router = Router();

router.post("/get-user-detail", getUserDetail)
router.post("/get-role-detail", getRoleDetail)

export default router;