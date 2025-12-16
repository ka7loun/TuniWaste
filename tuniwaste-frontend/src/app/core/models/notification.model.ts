export interface NotificationItem {
  id: string;
  type: 'bid' | 'message' | 'compliance' | 'system';
  title: string;
  detail: string;
  timestamp: string;
  read: boolean;
}

