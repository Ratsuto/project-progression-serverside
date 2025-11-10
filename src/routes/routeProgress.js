import {Router} from "express";
import {addNewProgress, listProgress, removeProgress, updateProgress} from "../controller/ProgressController.js";

const router = Router();

router.post("/add-progress", addNewProgress)
router.post("/list-progress", listProgress)
router.post("/update-progress", updateProgress)
router.post("/remove-progress", removeProgress)

export default router;