import { Request, Response } from 'express';
import { User, IUser } from '../models/User';
import { Wallet } from '../models/Wallet';
import { generateToken, generateRefreshToken } from '../utils/generateToken';

interface AuthRequest extends Request {
  user?: IUser;
}

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, phone, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      role: role || 'Customer',
    });

    if (user) {
      // Create wallet for user
      await Wallet.create({ userId: user._id });

      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        token: generateToken(user._id as any, user.role),
        refreshToken: generateRefreshToken(user._id as any),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Update last login
      user.lastLogin = new Date();
      await user.save();

      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        tier: user.tier,
        token: generateToken(user._id as any, user.role),
        refreshToken: generateRefreshToken(user._id as any),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
