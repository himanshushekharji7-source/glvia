import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export const generateToken = (id: mongoose.Types.ObjectId, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

export const generateRefreshToken = (id: mongoose.Types.ObjectId) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret', {
    expiresIn: '90d',
  });
};
