import mongoose, { Schema, Document } from 'mongoose';

interface KYCData {
  company: {
    legalName: string;
    registrationNumber: string;
    taxId: string;
    industry: string;
    hqCity: string;
  };
  compliance: {
    handlesHazmat: boolean;
    annualWaste: string;
    certifications: string[];
  };
  contacts: {
    complianceOfficer: string;
    phone: string;
    email: string;
  };
  documents: string[];
}

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  company: string;
  contact: string;
  role: 'generator' | 'buyer' | 'admin';
  verified: boolean;
  kyc?: KYCData;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  company: { type: String, required: true },
  contact: { type: String, required: true },
  role: { type: String, enum: ['generator', 'buyer', 'admin'], required: true },
  verified: { type: Boolean, default: false },
  kyc: {
    company: {
      legalName: String,
      registrationNumber: String,
      taxId: String,
      industry: String,
      hqCity: String,
    },
    compliance: {
      handlesHazmat: Boolean,
      annualWaste: String,
      certifications: [String],
    },
    contacts: {
      complianceOfficer: String,
      phone: String,
      email: String,
    },
    documents: [String],
  },
  createdAt: { type: Date, default: Date.now },
});

// Indexes (email index is already created by unique: true, so we don't duplicate it)
UserSchema.index({ role: 1 });
UserSchema.index({ verified: 1 });

export default mongoose.model<IUser>('User', UserSchema);

