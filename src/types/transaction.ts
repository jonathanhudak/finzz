export type TransactionType = 'credit' | 'debit';

export interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: TransactionType;
  accountId: string;
  category?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ImportedTransaction {
  date: string | Date;
  description: string;
  amount: number;
  type?: TransactionType;
  category?: string;
  notes?: string;
} 