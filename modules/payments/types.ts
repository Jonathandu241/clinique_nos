/// Définitions des types pour le module de paiement.

export type PaymentProvider = 'fake' | 'stripe';

export interface PaymentTransaction {
  id: string;
  appointmentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed';
  provider: PaymentProvider;
  reference?: string;
  createdAt: Date;
}

export interface PaymentProcessResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}
