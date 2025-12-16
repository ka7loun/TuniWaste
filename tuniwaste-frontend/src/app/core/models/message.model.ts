import { UserRole } from './user-role.type';

export interface MessageThread {
  id: string;
  counterpart: string;
  role: UserRole;
  unread: number;
  lastMessage: string;
  lastTimestamp: string;
}

export interface Message {
  id: string;
  threadId: string;
  sender: string;
  body: string;
  timestamp: string;
  attachments?: string[];
}

