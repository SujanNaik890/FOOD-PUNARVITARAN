import mongoose from 'mongoose';

const DonationImageSchema = new mongoose.Schema(
  {
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true
    },
    cloudinaryPublicId: {
      type: String,
      required: true
    },
    secureUrl: {
      type: String,
      required: true
    },
    imageHash: {
      type: String,
      required: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

DonationImageSchema.index({ donationId: 1 });

export const DonationImage = mongoose.model('DonationImage', DonationImageSchema);
