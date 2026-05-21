import { Request, Response } from 'express';
import { Booking } from '../models/Booking';
import { Service } from '../models/Service';

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req: any, res: Response) => {
  try {
    const {
      salonId,
      services: serviceIds,
      date,
      timeSlot, // from frontend
      totalAmount,
      paymentMethod,
    } = req.body;

    if (!serviceIds || serviceIds.length === 0) {
      return res.status(400).json({ message: 'No services selected' });
    }

    // Fetch full service details to populate the booking
    const selectedServices = await Service.find({ _id: { $in: serviceIds } });
    
    const mappedServices = selectedServices.map(s => ({
      serviceId: s._id,
      price: s.price,
      duration: s.duration
    }));

    const totalDuration = selectedServices.reduce((acc, s) => acc + s.duration, 0);
    
    // Calculate endTime from timeSlot and duration
    // For now, we'll just store timeSlot as startTime
    const startTime = timeSlot || req.body.startTime;
    
    // Simple end time calculation (mock)
    const [hours, minutes] = startTime.split(':');
    const startMins = parseInt(hours) * 60 + parseInt(minutes);
    const endMins = startMins + totalDuration;
    const endTime = `${Math.floor(endMins / 60)}:${(endMins % 60).toString().padStart(2, '0')}`;

    // Generate unique booking reference
    const bookingReference = 'BK-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    const booking = new Booking({
      bookingReference,
      userId: req.user._id,
      salonId,
      services: mappedServices,
      date,
      startTime,
      endTime,
      totalAmount,
      discountAmount: 0,
      taxAmount: Math.round(totalAmount * 0.08),
      finalAmount: totalAmount,
      paymentStatus: 'Pending',
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
