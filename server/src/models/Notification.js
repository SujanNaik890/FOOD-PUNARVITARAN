import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['DONATION_UPDATE', 'ALLOCATION_REQUEST', 'DELIVERY_DISPATCHED', 'SECURITY_ALERT'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    body: {
      type: String,
      required: true
    },
    actionUrl: {
      type: String
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

NotificationSchema.index({ recipientId: 1, isRead: 1 });
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 3600 }); // 30-day TTL

export const Notification = mongoose.model('Notification', NotificationSchema);
