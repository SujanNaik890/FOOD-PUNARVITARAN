import mongoose from 'mongoose';

const ChatMessageSchema = new mongoose.Schema(
  {
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation'
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    senderRole: {
      type: String,
      enum: ['DONOR', 'NGO_MANAGER', 'ADMIN'],
      required: true
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

ChatMessageSchema.index({ donationId: 1, createdAt: 1 });
ChatMessageSchema.index({ senderId: 1, recipientId: 1 });

export const ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);
