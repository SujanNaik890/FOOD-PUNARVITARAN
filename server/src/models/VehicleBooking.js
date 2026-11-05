import mongoose from 'mongoose';

const VehicleBookingSchema = new mongoose.Schema(
  {
    allocationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DonationAllocation',
      required: true
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true
    },
    bookingReference: {
      type: String,
      unique: true,
      required: true
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    pickupEta: {
      type: Date
    },
    dropoffEta: {
      type: Date
    },
    status: {
      type: String,
      enum: ['ASSIGNED', 'DISPATCHED', 'ARRIVED_PICKUP', 'IN_TRANSIT', 'ARRIVED_DROPOFF', 'COMPLETED', 'CANCELLED'],
      default: 'ASSIGNED'
    }
  },
  { timestamps: true }
);

VehicleBookingSchema.index({ allocationId: 1 });
VehicleBookingSchema.index({ status: 1 });

export const VehicleBooking = mongoose.model('VehicleBooking', VehicleBookingSchema);
