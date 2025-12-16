import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  threadId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  body: string;
  timestamp: Date;
  attachments: string[];
  readBy: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    threadId: { type: Schema.Types.ObjectId, ref: 'MessageThread', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    attachments: { type: [String], default: [] },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
  }
);

// Indexes
MessageSchema.index({ threadId: 1, timestamp: -1 });
MessageSchema.index({ timestamp: -1 });

export default mongoose.model<IMessage>('Message', MessageSchema);

