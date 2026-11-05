import mongoose from 'mongoose';

const DonorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    donorType: {
      type: String,
      enum: ['INDIVIDUAL', 'RESTAURANT', 'HOTEL', 'MARRIAGE_HALL', 'CORPORATE'],
      required: true
    },
    organizationName: {
      type: String,
      trim: true
    },
    fssaiLicenseNumber: {
      type: String,
      trim: true
    },
    address: {
      line1: { type: String, required: true },
      area: { type: String, required: true },
      city: { type: String, default: 'Bengaluru' },
      pincode: { type: String, required: true }
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    tier: {
      type: String,
      enum: ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'],
      default: 'BRONZE'
    },
    totalMealsDonated: {
      type: Number,
      default: 0
    },
    monetaryDonationTotal: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

DonorProfileSchema.index({ location: '2dsphere' });

export const DonorProfile = mongoose.model('DonorProfile', DonorProfileSchema);
