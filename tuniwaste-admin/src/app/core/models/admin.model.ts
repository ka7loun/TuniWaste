export interface DashboardStats {
  overview: {
    totalUsers: number;
    totalListings: number;
    totalBids: number;
    totalTransactions: number;
    totalMessages: number;
    totalNotifications: number;
    verifiedUsers: number;
    activeListings: number;
    completedTransactions: number;
    totalWasteDiverted: number;
    totalTransactionValue: number;
  };
  today: {
    users: number;
    listings: number;
    bids: number;
    transactions: number;
    messages: number;
  };
  thisWeek: {
    users: number;
    listings: number;
    bids: number;
    transactions: number;
  };
  thisMonth: {
    users: number;
    listings: number;
    bids: number;
    transactions: number;
  };
  distributions: {
    users: {
      generators: number;
      buyers: number;
      admins: number;
    };
    listings: {
      open: number;
      reserved: number;
      awarded: number;
    };
    transactions: {
      negotiation: number;
      contract: number;
      inTransit: number;
      delivered: number;
    };
    bids: {
      pending: number;
      accepted: number;
      declined: number;
    };
  };
}

export interface Activity {
  type: string;
  timestamp: string;
  data: any;
}

export interface ActivityTimeline {
  activities: Activity[];
  total: number;
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  [key: string]: T[] | {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
