import { Request, Response } from 'express';
import { Booking } from '../models/Booking';

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req: any, res: Response) => {
  try {
    const {
      salonId,
      services,
      date,
      startTime,
      endTime,
      totalAmount,
      discountAmount,
      taxAmount,
      finalAmount,
      paymentMethod,
    } = req.body;

    if (services && services.length === 0) {
      return res.status(400).json({ message: 'No services selected' });
    }

    // Generate unique booking reference
    const bookingReference = 'BK-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    const booking = new Booking({
      bookingReference,
      userId: req.user._id,
      salonId,
      services,
      date,
      startTime,
      endTime,
      totalAmount,
      discountAmount,
      taxAmount,
      finalAmount,
      paymentStatus: 'Pending', // will be updated when payment is verified
    });

    const createdBooking = await booking.save();
    
    res.status(201).json(createdBooking);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user bookings
// @route   GET /api/bookings/mybookings
// @access  Private
export const getMyBookings = async (req: any, res: Response) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id }).populate('salonId', 'name address images');
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req: any, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('salonId', 'name address contactEmail contactPhone')
      .populate('userId', 'firstName lastName email phone');

    if (booking) {
      // Basic auth check: only owner of booking, salon owner, or admin can view
      if (
        booking.userId._id.toString() === req.user._id.toString() ||
        req.user.role === 'Admin' ||
        req.user.role === 'SalonOwner' // Todo: check if this specific salon owner
      ) {
        res.json(booking);
      } else {
        res.status(403).json({ message: 'Not authorized to view this booking' });
      }
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
