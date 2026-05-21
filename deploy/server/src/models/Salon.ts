import mongoose, { Document, Schema } from 'mongoose';

export interface ISalon extends Document {
  ownerId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  contactEmail: string;
  contactPhone: string;
  images: string[];
  bannerImage?: string;
  businessHours: {
    day: string;
    open: string;
    close: string;
    isClosed: boolean;
  }[];
  isActive: boolean;
  isVerified: boolean;
  rating: number;
  totalReviews: number;
}

const salonSchema = new Schema<ISalon>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    images: [{ type: String }],
    bannerImage: { type: String },
    businessHours: [
      {
        day: { type: String },
        open: { type: String },
        close: { type: String },
        isClosed: { type: Boolean, default: false },
      },
    ],
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Salon = mongoose.model<ISalon>('Salon', salonSchema);
