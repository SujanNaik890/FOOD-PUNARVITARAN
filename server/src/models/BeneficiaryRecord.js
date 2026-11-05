import mongoose from 'mongoose';

const BeneficiaryRecordSchema = new mongoose.Schema(
  {
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NGOProfile',
      required: true
    },
    dateRecorded: {
      type: Date,
      default: Date.now
    },
    targetGroup: {
      type: String,
      enum: ['CHILDREN', 'ELDERLY', 'HOMELESS', 'SLUM_COMMUNITY', 'MIGRANT_WORKERS'],
      required: true
    },
    headcount: {
      type: Number,
      required: true,
      min: 1
    },
    dietaryRequirements: {
      type: [String],
      enum: ['VEG_ONLY', 'HIGH_PROTEIN', 'SOFT_FOOD', 'NO_RESTRICTION'],
      default: ['VEG_ONLY']
    },
    mealTimePreference: {
      type: [String],
      enum: ['BREAKFAST', 'LUNCH', 'DINNER'],
      default: ['LUNCH', 'DINNER']
    }
  },
  { timestamps: true }
);

BeneficiaryRecordSchema.index({ ngoId: 1, dateRecorded: -1 });

export const BeneficiaryRecord = mongoose.model('BeneficiaryRecord', BeneficiaryRecordSchema);
