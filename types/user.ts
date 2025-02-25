export interface User {
  id: string
  username: string
  role: string
  office: string
  status: string
  receivesWithdrawals: boolean
  withdrawal?: string
  createdAt: Date
} 