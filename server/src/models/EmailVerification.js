import mongoose from 'mongoose';

const EmailVerificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    tokenHash: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true,
      expires: 0 // TTL
    },
    attempts: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

EmailVerificationSchema.index({ tokenHash: 1 });

export const EmailVerification = mongoose.model('EmailVerification', EmailVerificationSchema);
