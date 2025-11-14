import {Router} from "express";
import {getUserDetail, getRoleDetail, operatorList, operatorRoleList} from "../controller/UserDetailController.js";

const router = Router();

router.post("/get-user-detail", getUserDetail)
router.post("/get-role-detail", getRoleDetail)
router.post("/get-operator", operatorList)
router.post("/get-role", operatorRoleList)

export default router;