import mongoose, { Schema, Document } from 'mongoose';

export interface IMessageThread extends Document {
  participants: mongoose.Types.ObjectId[];
  listingId?: mongoose.Types.ObjectId;
  lastMessage: string;
  lastTimestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MessageThreadSchema: Schema = new Schema(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    listingId: { type: Schema.Types.ObjectId, ref: 'Listing' },
    lastMessage: { type: String, default: '' },
    lastTimestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Indexes
MessageThreadSchema.index({ participants: 1 });
MessageThreadSchema.index({ listingId: 1 });
MessageThreadSchema.index({ lastTimestamp: -1 });

export default mongoose.model<IMessageThread>('MessageThread', MessageThreadSchema);

