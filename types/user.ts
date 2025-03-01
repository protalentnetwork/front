export interface User {
  id: string
  username: string
  role: string
  office: string | number
  status: string
  receivesWithdrawals: boolean
  withdrawal?: string
  createdAt: Date
} 