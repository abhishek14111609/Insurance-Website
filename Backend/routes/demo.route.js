import express from 'express';
import { MsgController } from '../controllers/demo.controller.js';
const router = express.Router();

router.get('/abc',MsgController)

export default router;