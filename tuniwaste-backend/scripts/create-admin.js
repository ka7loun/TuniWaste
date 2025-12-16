/**
 * Script to create an admin user in the database
 * 
 * Usage: node --loader ts-node/esm scripts/create-admin.js <email> <password> [company] [contact]
 * OR: tsx scripts/create-admin.js <email> <password> [company] [contact]
 * 
 * Example: tsx scripts/create-admin.js admin@tuniwaste.com admin123 "TuniWaste Admin" "Super Admin"
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const UserSchema = new mongoose.Schema({
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

const User = mongoose.model('User', UserSchema);

async function createAdmin() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node scripts/create-admin.js <email> <password> [company] [contact]');
    console.error('Example: node scripts/create-admin.js admin@tuniwaste.com admin123 "TuniWaste Admin" "Super Admin"');
    process.exit(1);
  }

  const email = args[0];
  const password = args[1];
  const company = args[2] || 'TuniWaste Admin';
  const contact = args[3] || 'Super Admin';

  // Connect to MongoDB
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tuniwaste';
  console.log('Connecting to MongoDB...');
  
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`User with email ${email} already exists.`);
      
      // Update to admin if not already
      if (existingUser.role !== 'admin') {
        existingUser.role = 'admin';
        existingUser.verified = true;
        if (password) {
          existingUser.passwordHash = await bcrypt.hash(password, 10);
        }
        await existingUser.save();
        console.log(`✓ Updated user to admin role`);
      } else {
        console.log(`User is already an admin.`);
        if (password) {
          existingUser.passwordHash = await bcrypt.hash(password, 10);
          await existingUser.save();
          console.log(`✓ Updated password`);
        }
      }
    } else {
      // Create new admin user
      const passwordHash = await bcrypt.hash(password, 10);
      const adminUser = new User({
        email,
        passwordHash,
        company,
        contact,
        role: 'admin',
        verified: true,
      });

      await adminUser.save();
      console.log(`✓ Admin user created successfully!`);
      console.log(`  Email: ${email}`);
      console.log(`  Company: ${company}`);
      console.log(`  Contact: ${contact}`);
      console.log(`  Role: admin`);
      console.log(`  Verified: true`);
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createAdmin();

