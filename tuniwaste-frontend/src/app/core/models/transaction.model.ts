export interface Transaction {
  id: string;
  listingTitle: string;
  counterparty: string;
  value: number;
  stage: 'negotiation' | 'in-transit' | 'delivered';
  updatedAt: string;
  documents: string[];
}

