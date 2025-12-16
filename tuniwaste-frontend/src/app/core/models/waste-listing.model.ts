import { UserRole } from './user-role.type';

export type MaterialCategory =
  | 'metals'
  | 'plastics'
  | 'chemicals'
  | 'organics'
  | 'construction'
  | 'textiles';

export interface WasteListing {
  id: string;
  title: string;
  material: string;
  category: MaterialCategory;
  quantityTons: number;
  location: string;
  coords: [number, number];
  seller: string;
  status: 'open' | 'reserved' | 'awarded';
  pricePerTon: number;
  certifications: string[];
  availableFrom: string;
  expiresOn: string;
  pickupRequirements: string;
  documents: string[];
  thumbnail: string;
  matchedRole: UserRole;
}

export interface ListingFilter {
  role: UserRole | 'all';
  category: MaterialCategory | 'all';
  location: string;
  minQuantity: number;
}

