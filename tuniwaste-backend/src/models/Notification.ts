import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType = 'bid' | 'message' | 'compliance' | 'system';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  detail: string;
  relatedId?: mongoose.Types.ObjectId; // Polymorphic reference
  read: boolean;
  timestamp: Date;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['bid', 'message', 'compliance', 'system'],
      required: true,
    },
    title: { type: String, required: true },
    detail: { type: String, required: true },
    relatedId: { type: Schema.Types.ObjectId }, // Can reference Bid, Message, Transaction, etc.
    read: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Indexes
NotificationSchema.index({ userId: 1, read: 1, timestamp: -1 });
NotificationSchema.index({ timestamp: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);

