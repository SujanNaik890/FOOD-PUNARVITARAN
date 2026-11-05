import mongoose from 'mongoose';

const NGOProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    ngoName: {
      type: String,
      required: true,
      trim: true
    },
    registrationNumber: {
      type: String,
      required: true,
      trim: true
    },
    verificationStatus: {
      type: String,
      enum: ['UNVERIFIED', 'PENDING_REVIEW', 'VERIFIED', 'REJECTED'],
      default: 'PENDING_REVIEW'
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: {
      type: Date
    },
    rejectionReason: {
      type: String
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
    operatingHours: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '22:00' }
    },
    storageFacilities: {
      hasRefrigeration: { type: Boolean, default: false },
      maxCapacityKg: { type: Number, default: 100 }
    },
    foodPreferences: {
      type: [String],
      enum: ['VEG', 'NON_VEG', 'RAW_GRAINS', 'PACKAGED', 'COOKED'],
      default: ['VEG', 'COOKED', 'PACKAGED']
    },
    currentHeadcount: {
      type: Number,
      default: 50
    },
    acceptanceReliabilityScore: {
      type: Number,
      default: 1.0,
      min: 0,
      max: 1
    }
  },
  {
    timestamps: true
  }
);

NGOProfileSchema.index({ location: '2dsphere' });
NGOProfileSchema.index({ verificationStatus: 1 });

export const NGOProfile = mongoose.model('NGOProfile', NGOProfileSchema);
