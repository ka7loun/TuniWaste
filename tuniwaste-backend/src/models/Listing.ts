import mongoose, { Schema, Document } from 'mongoose';

export type MaterialCategory =
  | 'metals'
  | 'plastics'
  | 'chemicals'
  | 'organics'
  | 'construction'
  | 'textiles';

export type ListingStatus = 'open' | 'reserved' | 'awarded';

export interface IListing extends Document {
  title: string;
  material: string;
  category: MaterialCategory;
  quantityTons: number;
  location: string;
  coords: [number, number]; // [longitude, latitude]
  seller: mongoose.Types.ObjectId;
  status: ListingStatus;
  pricePerTon: number;
  certifications: string[];
  availableFrom: Date;
  expiresOn: Date;
  pickupRequirements: string;
  documents: string[];
  thumbnail: string;
  createdAt: Date;
  updatedAt: Date;
}

const ListingSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    material: { type: String, required: true },
    category: {
      type: String,
      enum: ['metals', 'plastics', 'chemicals', 'organics', 'construction', 'textiles'],
      required: true,
    },
    quantityTons: { type: Number, required: true, min: 0 },
    location: { type: String, required: true },
    coords: {
      type: [Number],
      required: true,
      validate: {
        validator: (v: number[]) => v.length === 2 && v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90,
        message: 'Coordinates must be [longitude, latitude]',
      },
    },
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['open', 'reserved', 'awarded'],
      default: 'open',
    },
    pricePerTon: { type: Number, required: true, min: 0 },
    certifications: { type: [String], default: [] },
    availableFrom: { type: Date, required: true },
    expiresOn: { type: Date, required: true },
    pickupRequirements: { type: String, default: '' },
    documents: { type: [String], default: [] },
    thumbnail: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

// Indexes
ListingSchema.index({ seller: 1 });
ListingSchema.index({ status: 1 });
ListingSchema.index({ category: 1 });
ListingSchema.index({ coords: '2dsphere' }); // Geospatial index
ListingSchema.index({ createdAt: -1 });

export default mongoose.model<IListing>('Listing', ListingSchema);

