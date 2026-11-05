import mongoose from 'mongoose';

const PasswordResetSchema = new mongoose.Schema(
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
    consumed: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

PasswordResetSchema.index({ tokenHash: 1 });

export const PasswordReset = mongoose.model('PasswordReset', PasswordResetSchema);
