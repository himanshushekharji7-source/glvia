import { Request, Response } from 'express';
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import { Booking } from '../models/Booking';
import { Payment } from '../models/Payment';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-04-10', // Use latest API version available or standard
});

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder',
});

// @desc    Create Stripe Payment Intent
// @route   POST /api/payments/stripe/create-intent
// @access  Private
export const createStripePaymentIntent = async (req: any, res: Response) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to pay for this booking' });
    }

    const amountInCents = Math.round(booking.finalAmount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: { bookingId: booking._id.toString() },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create Razorpay Order
// @route   POST /api/payments/razorpay/create-order
// @access  Private
export const createRazorpayOrder = async (req: any, res: Response) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const options = {
      amount: Math.round(booking.finalAmount * 100), // amount in smallest currency unit
      currency: 'INR', // Default to INR for Razorpay, adjust as needed
      receipt: `receipt_order_${booking._id}`,
    };

    const order = await razorpay.orders.create(options);

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Payment and Update Booking
// @route   POST /api/payments/verify
// @access  Private
export const verifyPaymentAndUpdateBooking = async (req: any, res: Response) => {
  try {
    const { bookingId, paymentMethod, transactionId, status } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (status === 'Completed' || status === 'Paid') {
      booking.paymentStatus = 'Paid';
      booking.status = 'Confirmed';
      await booking.save();

      await Payment.create({
        bookingId: booking._id,
        userId: req.user._id,
        amount: booking.finalAmount,
        currency: paymentMethod === 'Razorpay' ? 'INR' : 'USD',
        method: paymentMethod,
        status: 'Completed',
        transactionId,
      });

      res.json({ message: 'Payment verified and booking confirmed', booking });
    } else {
      res.status(400).json({ message: 'Payment verification failed' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
