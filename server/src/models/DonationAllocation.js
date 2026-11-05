import mongoose from 'mongoose';

const DonationAllocationSchema = new mongoose.Schema(
  {
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true,
      unique: true
    },
    allocatedByAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    selectedNgoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NGOProfile',
      required: true
    },
    matchingScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    allocationNotes: {
      type: String
    },
    status: {
      type: String,
      enum: ['PROPOSED', 'APPROVED', 'ACCEPTED_BY_NGO', 'REJECTED_BY_NGO', 'SUPERSEDED'],
      default: 'APPROVED'
    }
  },
  {
    timestamps: true
  }
);

DonationAllocationSchema.index({ selectedNgoId: 1 });

export const DonationAllocation = mongoose.model('DonationAllocation', DonationAllocationSchema);
