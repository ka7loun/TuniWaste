import mongoose, { Schema, Document } from 'mongoose';

export type TransactionStage = 'negotiation' | 'in-transit' | 'delivered';

export interface ITransaction extends Document {
  listingId: mongoose.Types.ObjectId;
  bidId: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  buyer: mongoose.Types.ObjectId;
  value: number;
  stage: TransactionStage;
  documents: string[];
  updatedAt: Date;
  createdAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
    bidId: { type: Schema.Types.ObjectId, ref: 'Bid', required: true },
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    value: { type: Number, required: true, min: 0 },
    stage: {
      type: String,
      enum: ['negotiation', 'in-transit', 'delivered'],
      default: 'negotiation',
    },
    documents: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

// Indexes
TransactionSchema.index({ seller: 1 });
TransactionSchema.index({ buyer: 1 });
TransactionSchema.index({ stage: 1 });
TransactionSchema.index({ createdAt: -1 });

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);

