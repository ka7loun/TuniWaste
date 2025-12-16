export interface User {
  _id: string;
  email: string;
  company: string;
  contact: string;
  role: 'generator' | 'buyer' | 'admin';
  verified: boolean;
  kyc?: any;
  createdAt: string;
}

export interface UserStats {
  listings: number;
  bids: number;
  transactionsAsSeller: number;
  transactionsAsBuyer: number;
}
