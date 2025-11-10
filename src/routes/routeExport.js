import {Router} from "express";
import {exportExcel} from "../controller/ExportController.js";

const router = Router();

router.get("/excel", exportExcel);

export default router;