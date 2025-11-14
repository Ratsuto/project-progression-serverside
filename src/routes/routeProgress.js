import {Router} from "express";
import {addNewProgress, countAllProgress, countFinishedProgress, countProgressByMonth, countUnfinishedProgress, listProgress, removeProgress, updateProgress} from "../controller/ProgressController.js";

const router = Router();

router.post("/add-progress", addNewProgress)
router.post("/list-progress", listProgress)
router.post("/update-progress", updateProgress)
router.post("/remove-progress", removeProgress)
router.post("/count-finished", countFinishedProgress)
router.post("/count-unfinished", countUnfinishedProgress)
router.post("/count-all", countAllProgress)
router.post("/count-filter", countProgressByMonth)

export default router;