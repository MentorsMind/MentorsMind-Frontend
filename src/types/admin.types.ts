// Admin types for list endpoints

export interface AdminListMeta {
  total: number;
  limit: number;
  offset: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'Mentee' | 'Mentor' | 'Admin';
  createdAt: string;
  lastActive?: string;
  status: 'active' | 'inactive' | 'suspended';
}

export interface AdminTransaction {
  id: string;
  type: 'payment' | 'refund' | 'payout';
  amount: number;
  asset: string;
  status: string;
  createdAt: string;
  userId: string;
  userName: string;
  sessionId?: string;
}

export interface AdminSession {
  id: string;
  mentorName: string;
  learnerName: string;
  scheduledAt: string;
  duration: number;
  status: string;
  price: number;
  asset: string;
  topic?: string;
}

export interface AdminPayment {
  id: string;
  sessionId: string;
  amount: number;
  asset: string;
  status: string;
  stellarTxHash?: string;
  createdAt: string;
  mentorName: string;
  learnerName: string;
}

export interface AdminDispute {
  id: string;
  sessionId: string;
  type: string;
  status: string;
  createdAt: string;
  resolvedAt?: string;
  mentorName: string;
  learnerName: string;
  amount: number;
  asset: string;
}

export interface AdminLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  action: string;
  userId?: string;
  userName?: string;
  ipAddress?: string;
  details?: string;
}

export interface AdminListResponse<T> {
  data: T[];
  meta: AdminListMeta;
}

export interface EmailPreviewResponse {
  template: string;
  subject: string;
  html: string;
  text: string;
  sampleData: any;
}

export interface EmailPreviewRequest {
  sampleData?: any;
}

// Revenue report types

export type RevenuePeriod = '7d' | '30d' | '90d' | '1y';

export interface RevenueSummary {
  totalRevenue: number;
  transactionCount: number;
  platformFees: number;
  currency?: string;
}

export interface RevenueDailyPoint {
  date: string;
  revenue: number;
}

export interface RevenueTransaction {
  id: string;
  amount: number;
  asset: string;
  status: string;
  createdAt: string;
  userId: string;
  userName: string;
  sessionId?: string;
  type?: string;
}

export interface RevenueTransactionsResponse {
  data: RevenueTransaction[];
  meta: AdminListMeta;
}