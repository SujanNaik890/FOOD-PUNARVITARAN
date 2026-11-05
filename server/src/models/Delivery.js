import mongoose from 'mongoose';

const DeliverySchema = new mongoose.Schema(
  {
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true,
      unique: true
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true
    },
    assignedNgoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NGOProfile',
      required: true
    },
    pickupOtpHash: {
      type: String,
      required: true
    },
    deliveryOtpHash: {
      type: String,
      required: true
    },
    pickupConfirmedAt: {
      type: Date
    },
    deliveredAt: {
      type: Date
    },
    receivedQuantity: {
      type: Number
    },
    proofOfDeliveryImageUrl: {
      type: String
    },
    status: {
      type: String,
      enum: ['ASSIGNED', 'PICKUP_EN_ROUTE', 'FOOD_PICKED_UP', 'DELIVERY_EN_ROUTE', 'COMPLETED', 'FAILED'],
      default: 'ASSIGNED'
    }
  },
  {
    timestamps: true
  }
);

DeliverySchema.index({ vehicleId: 1 });
DeliverySchema.index({ assignedNgoId: 1 });

export const Delivery = mongoose.model('Delivery', DeliverySchema);
