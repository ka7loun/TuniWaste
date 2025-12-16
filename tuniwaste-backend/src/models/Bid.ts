import mongoose, { Schema, Document } from 'mongoose';

export type BidStatus = 'pending' | 'accepted' | 'declined';

export interface IBid extends Document {
  listingId: mongoose.Types.ObjectId;
  bidder: mongoose.Types.ObjectId;
  amount: number;
  status: BidStatus;
  timestamp: Date;
  createdAt: Date;
}

const BidSchema: Schema = new Schema(
  {
    listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
    bidder: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Indexes
BidSchema.index({ listingId: 1 });
BidSchema.index({ bidder: 1 });
BidSchema.index({ status: 1 });
BidSchema.index({ timestamp: -1 });

export default mongoose.model<IBid>('Bid', BidSchema);

