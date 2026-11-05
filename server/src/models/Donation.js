import mongoose from 'mongoose';

const DonationSchema = new mongoose.Schema(
  {
    donationCode: {
      type: String,
      unique: true,
      required: true
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DonorProfile',
      required: true
    },
    foodCategory: {
      type: String,
      enum: ['COOKED_MEALS', 'RAW_RATION', 'PACKAGED_FOOD', 'BAKERY_DAIRY'],
      required: true
    },
    dietaryType: {
      type: String,
      enum: ['VEG', 'NON_VEG', 'VEGAN'],
      required: true
    },
    foodItems: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        unit: { type: String, enum: ['KG', 'PORTIONS', 'PACKETS', 'LITERS'], required: true },
        preparedAt: { type: Date }
      }
    ],
    totalPortionsEstimated: {
      type: Number,
      required: true
    },
    perishable: {
      type: Boolean,
      default: true
    },
    consumptionDeadline: {
      type: Date,
      required: true
    },
    storageCondition: {
      type: String,
      enum: ['AMBIENT', 'REFRIGERATED', 'HEATED'],
      default: 'AMBIENT'
    },
    pickupAddress: {
      line1: { type: String, required: true },
      area: { type: String, required: true },
      city: { type: String, default: 'Bengaluru' },
      pincode: { type: String, required: true },
      contactPerson: { type: String, required: true },
      contactPhone: { type: String, required: true }
    },
    pickupLocation: {
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
    status: {
      type: String,
      enum: [
        'DRAFT',
        'SUBMITTED',
        'VALIDATED',
        'REJECTED',
        'MATCHING',
        'ALLOCATED_PENDING_APPROVAL',
        'NGO_NOTIFIED',
        'NGO_ACCEPTED',
        'VEHICLE_ASSIGNED',
        'PICKUP_IN_PROGRESS',
        'FOOD_COLLECTED',
        'IN_TRANSIT',
        'ARRIVED_AT_DESTINATION',
        'DELIVERED_CONFIRMED',
        'CLOSED',
        'CANCELLED'
      ],
      default: 'SUBMITTED'
    },
    rejectionReason: { type: String },
    cancellationReason: { type: String },
    notes: { type: String }
  },
  {
    timestamps: true
  }
);

DonationSchema.index({ pickupLocation: '2dsphere' });
DonationSchema.index({ status: 1 });
DonationSchema.index({ consumptionDeadline: 1 });
DonationSchema.index({ donorId: 1 });

export const Donation = mongoose.model('Donation', DonationSchema);
