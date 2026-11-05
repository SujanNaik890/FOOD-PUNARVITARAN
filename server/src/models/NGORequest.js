import mongoose from 'mongoose';

const NGORequestSchema = new mongoose.Schema(
  {
    allocationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DonationAllocation',
      required: true
    },
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NGOProfile',
      required: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'DECLINED', 'TIMED_OUT'],
      default: 'PENDING'
    },
    responseDeadline: {
      type: Date,
      required: true
    },
    declinedReason: {
      type: String
    },
    respondedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

NGORequestSchema.index({ allocationId: 1 });
NGORequestSchema.index({ ngoId: 1, status: 1 });

export const NGORequest = mongoose.model('NGORequest', NGORequestSchema);
