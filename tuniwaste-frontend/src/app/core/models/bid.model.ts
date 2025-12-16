export interface Bid {
  id: string;
  listingId: string;
  bidder: string;
  amount: number;
  timestamp: string;
  status: 'pending' | 'accepted' | 'declined';
}

