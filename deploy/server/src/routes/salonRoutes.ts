import express from 'express';
import { getSalons, getSalonById, createSalon, getMySalonStats } from '../controllers/salonController';
import { protect, salonOwner } from '../middlewares/authMiddleware';

const router = express.Router();

router.route('/').get(getSalons).post(protect, salonOwner, createSalon);
router.route('/my-salon/stats').get(protect, salonOwner, getMySalonStats);
router.route('/:id').get(getSalonById);

export default router;
