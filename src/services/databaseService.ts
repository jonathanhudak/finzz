import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { Transaction } from '../types/transaction';

export class DatabaseService {
  private db: Database | null = null;
  private dbPath: string;

  constructor(dbPath: string = 'finance-tracker.db') {
    this.dbPath = dbPath;
  }

  async initialize(): Promise<void> {
    this.db = await open({
      filename: this.dbPath,
      driver: sqlite3.Database
    });

    await this.createTables();
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        type TEXT NOT NULL,
        accountId TEXT NOT NULL,
        category TEXT,
        notes TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `);
  }

  async saveTransactions(transactions: Transaction[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = await this.db.prepare(`
      INSERT INTO transactions (id, date, description, amount, type, accountId, category, notes, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const transaction of transactions) {
      await stmt.run([
        transaction.id,
        transaction.date.toISOString(),
        transaction.description,
        transaction.amount,
        transaction.type,
        transaction.accountId,
        transaction.category,
        transaction.notes,
        transaction.createdAt.toISOString(),
        transaction.updatedAt.toISOString()
      ]);
    }

    await stmt.finalize();
  }

  async getTransactions(accountId: string): Promise<Transaction[]> {
    if (!this.db) throw new Error('Database not initialized');

    const rows = await this.db.all<any[]>(
      'SELECT * FROM transactions WHERE accountId = ?',
      [accountId]
    );

    return rows.map(row => ({
      ...row,
      date: new Date(row.date),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    }));
  }
} 