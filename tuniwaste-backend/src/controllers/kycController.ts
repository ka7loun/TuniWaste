import { Request, Response } from 'express';
import User from '../models/User.js';

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

export const submitKYC = async (req: Request, res: Response) => {
  try {
    const userId = req.userId; // Get from JWT token via middleware
    const kycData: KYCData = req.body.kyc;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Save KYC data and mark as verified
    (user as any).kyc = kycData;
    user.verified = true;
    await user.save();

    res.json({
      message: 'KYC submitted successfully',
      user: {
        id: user._id,
        email: user.email,
        company: user.company,
        contact: user.contact,
        role: user.role,
        verified: user.verified,
      },
    });
  } catch (error: any) {
    console.error('KYC submission error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

