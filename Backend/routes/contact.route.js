import express from 'express';
import { submitInquiry, getAllInquiries, replyToInquiry } from '../controllers/contact.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/submit', submitInquiry);
router.get('/all', authenticate, authorize('admin'), getAllInquiries);
router.post('/reply/:id', authenticate, authorize('admin'), replyToInquiry);

export default router;
