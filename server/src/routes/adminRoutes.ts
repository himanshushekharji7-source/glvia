import express from 'express';
import { getAdminStats } from '../controllers/adminController';
import { protect, admin } from '../middlewares/authMiddleware';

const router = express.Router();

router.route('/stats').get(protect, admin, getAdminStats);

export default router;
