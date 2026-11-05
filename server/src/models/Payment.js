import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    razorpayOrderId: {
      type: String,
      unique: true,
      required: true
    },
    razorpayPaymentId: {
      type: String,
      unique: true,
      sparse: true
    },
    razorpaySignature: {
      type: String
    },
    amountInPaise: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    },
    status: {
      type: String,
      enum: ['CREATED', 'CAPTURED', 'FAILED', 'REFUNDED'],
      default: 'CREATED'
    },
    taxExemption80GRequested: {
      type: Boolean,
      default: true
    },
    panNumber: {
      type: String
    }
  },
  { timestamps: true }
);

PaymentSchema.index({ donorId: 1 });

export const Payment = mongoose.model('Payment', PaymentSchema);
