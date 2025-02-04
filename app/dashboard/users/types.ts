export interface User {
  id: string;
  username: string;
  role: string;
  createdAt: Date;
  office: string;
  status: 'active' | 'inactive';
  receivesWithdrawals: boolean;
} 