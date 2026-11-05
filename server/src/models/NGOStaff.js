import mongoose from 'mongoose';

const NGOStaffSchema = new mongoose.Schema(
  {
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NGOProfile',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      enum: ['DIRECTOR', 'VOLUNTEER_LEAD', 'LOGISTICS_COORDINATOR'],
      default: 'VOLUNTEER_LEAD'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

NGOStaffSchema.index({ ngoId: 1 });

export const NGOStaff = mongoose.model('NGOStaff', NGOStaffSchema);
