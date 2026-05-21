import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password?: string; // Optional for OAuth
  phone?: string;
  role: 'Customer' | 'SalonOwner' | 'Admin';
  profileImage?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  tier: 'Basic' | 'Silver' | 'Gold' | 'Platinum';
  totalSpent: number;
  lastLogin?: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // optional for social login
    phone: { type: String },
    role: { type: String, enum: ['Customer', 'SalonOwner', 'Admin'], default: 'Customer' },
    profileImage: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    tier: { type: String, enum: ['Basic', 'Silver', 'Gold', 'Platinum'], default: 'Basic' },
    totalSpent: { type: Number, default: 0 },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

userSchema.methods.matchPassword = async function (enteredPassword: string) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export const User = mongoose.model<IUser>('User', userSchema);
