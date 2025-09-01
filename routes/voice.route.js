import { Router } from "express";
import { getSpeechToText } from "../controllers/voice.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

router.route('/stt').post(upload.single('media'), getSpeechToText);

export default router;