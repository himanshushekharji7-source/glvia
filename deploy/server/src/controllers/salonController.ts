import { Request, Response } from 'express';
import { Salon } from '../models/Salon';
import { Service } from '../models/Service';
import { Booking } from '../models/Booking';

// @desc    Get Salon Owner Stats
// @route   GET /api/salons/my-salon/stats
// @access  Private/SalonOwner
export const getMySalonStats = async (req: any, res: Response) => {
  try {
    const salon = await Salon.findOne({ ownerId: req.user._id });
    if (!salon) {
      return res.status(404).json({ message: 'Salon not found for this owner' });
    }

    const totalBookings = await Booking.countDocuments({ salonId: salon._id });
    const completedBookings = await Booking.find({ salonId: salon._id, status: 'Completed' });
    const dailyRevenue = completedBookings.reduce((acc, b) => acc + b.finalAmount, 0);
    
    // Mocking some stats for dashboard
    const cancellationRate = "2.4%";
    const activeStaff = 8;
    
    const recentBookings = await Booking.find({ salonId: salon._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'firstName email');

    res.json({
      totalBookings,
      dailyRevenue,
      cancellationRate,
      activeStaff,
      recentBookings
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all active salons with optional search
// @route   GET /api/salons
// @access  Public
export const getSalons = async (req: Request, res: Response) => {
  try {
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};

    const salons = await Salon.find({ ...keyword, isActive: true }).select('-__v');
    res.json(salons);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get salon by ID with services
// @route   GET /api/salons/:id
// @access  Public
export const getSalon = async (req: Request, res: Response) => {
  try {
    const salon = await Salon.findById(req.params.id).populate('services');
    if (!salon) {
      return res.status(404).json({ message: 'Salon not found' });
    }

    res.json(salon);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new salon (Owner)
// @route   POST /api/salons
// @access  Private/SalonOwner
export const createSalon = async (req: any, res: Response) => {
  try {
    const { name, slug, description, address, contactEmail, contactPhone } = req.body;

    const salonExists = await Salon.findOne({ slug });
    if (salonExists) {
      return res.status(400).json({ message: 'Salon slug already exists' });
    }

    const salon = await Salon.create({
      ownerId: req.user._id,
      name,
      slug,
      description,
      address,
      contactEmail,
      contactPhone,
    });

    res.status(201).json(salon);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
