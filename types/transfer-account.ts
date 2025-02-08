export interface TransferAccount {
  id: string;
  userName: string;
  office: string;
  cbu: string;
  alias: string;
  wallet: 'mercadopago' | 'paypal';
  operator: string;
  agent: string;
  createdAt: Date;
  isActive: boolean;
} 