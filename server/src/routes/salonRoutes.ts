import express from 'express';
import { getSalons, getSalonById, createSalon } from '../controllers/salonController';
import { protect, salonOwner } from '../middlewares/authMiddleware';

const router = express.Router();

router.route('/').get(getSalons).post(protect, salonOwner, createSalon);
router.route('/:id').get(getSalonById);

export default router;
