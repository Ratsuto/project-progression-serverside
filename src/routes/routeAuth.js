import {Router} from "express";
import multer from "multer";
import {getLoginDetail, registerUserDetail} from "../controller/AuthorizeController.js";

const router = Router();
const upload = multer(); // memory storage (keeps file in RAM)

router.post("/login", getLoginDetail)
router.post("/register", upload.single("operatorImage"), registerUserDetail)

export default router;