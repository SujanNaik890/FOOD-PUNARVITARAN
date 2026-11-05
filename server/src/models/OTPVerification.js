import mongoose from 'mongoose';

const OTPVerificationSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      trim: true
    },
    hashedOtp: {
      type: String,
      required: true
    },
    purpose: {
      type: String,
      enum: ['REGISTRATION', 'LOGIN', 'PASSWORD_RESET', 'DELIVERY_HANDOVER'],
      required: true
    },
    attempts: {
      type: Number,
      default: 0
    },
    expiresAt: {
      type: Date,
      required: true,
      expires: 0 // MongoDB TTL index
    }
  },
  {
    timestamps: true
  }
);

OTPVerificationSchema.index({ phone: 1, purpose: 1 });

export const OTPVerification = mongoose.model('OTPVerification', OTPVerificationSchema);
