import { Request, Response } from 'express';
import { User } from '../models/User';
import { Salon } from '../models/Salon';
import { Booking } from '../models/Booking';

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'Customer' });
    const activeSalons = await Salon.countDocuments({ isActive: true });
    
    // Calculate total revenue and bookings
    const bookings = await Booking.find({ status: { $in: ['Completed', 'Confirmed'] } });
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((acc, booking) => acc + booking.finalAmount, 0);

    // Get top salons
    const topSalonsAgg = await Booking.aggregate([
      { $match: { status: { $in: ['Completed', 'Confirmed'] } } },
      {
        $group: {
          _id: '$salonId',
          revenue: { $sum: '$finalAmount' },
          bookingsCount: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 4 }
    ]);

    const topSalons = await Salon.populate(topSalonsAgg, { path: '_id', select: 'name rating' });

    res.json({
      totalUsers,
      activeSalons,
      totalBookings,
      totalRevenue,
      topSalons: topSalons.map((ts: any) => ({
        id: ts._id._id,
        name: ts._id.name,
        rating: ts._id.rating,
        revenue: ts.revenue,
        bookings: ts.bookingsCount
      }))
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
