import mongoose from 'mongoose';

const VehicleSchema = new mongoose.Schema(
  {
    providerType: {
      type: String,
      enum: ['INTERNAL_NGO', 'AUTHORIZED_PARTNER', 'VOLUNTEER'],
      required: true
    },
    vehicleType: {
      type: String,
      enum: ['TWO_WHEELER', 'AUTO_CARGO', 'TEMPO_VAN', 'REFRIGERATED_TRUCK'],
      required: true
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    driverName: {
      type: String,
      required: true,
      trim: true
    },
    driverPhone: {
      type: String,
      required: true,
      trim: true
    },
    capacityKg: {
      type: Number,
      required: true
    },
    hasCooling: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    }
  },
  {
    timestamps: true
  }
);

VehicleSchema.index({ currentLocation: '2dsphere' });
VehicleSchema.index({ isActive: 1 });

export const Vehicle = mongoose.model('Vehicle', VehicleSchema);
