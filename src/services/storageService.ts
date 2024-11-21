import { SecureStorage } from '../utils/secureStorage';
import { app } from 'electron';
import path from 'path';

export class StorageService {
  private secureStorage: SecureStorage;
  private initialized: boolean = false;

  constructor() {
    const userDataPath = app.getPath('userData');
    const dataDir = path.join(userDataPath, 'secure-data');
    this.secureStorage = new SecureStorage(dataDir);
  }

  async initialize(password: string): Promise<void> {
    await this.secureStorage.initialize(password);
    this.initialized = true;
  }

  async saveTransactions(transactions: any[]): Promise<void> {
    this.checkInitialized();
    await this.secureStorage.store('transactions', transactions);
  }

  async getTransactions(): Promise<any[]> {
    this.checkInitialized();
    return await this.secureStorage.retrieve('transactions') || [];
  }

  async saveCategories(categories: any[]): Promise<void> {
    this.checkInitialized();
    await this.secureStorage.store('categories', categories);
  }

  async getCategories(): Promise<any[]> {
    this.checkInitialized();
    return await this.secureStorage.retrieve('categories') || [];
  }

  private checkInitialized(): void {
    if (!this.initialized) {
      throw new Error('StorageService not initialized');
    }
  }
} 