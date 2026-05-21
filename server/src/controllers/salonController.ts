import { Request, Response } from 'express';
import { Salon } from '../models/Salon';
import { Service } from '../models/Service';

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
