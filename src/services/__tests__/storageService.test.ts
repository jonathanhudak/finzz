import { StorageService } from '../storageService';
import { app } from 'electron';
import { promises as fs } from 'fs';
import path from 'path';

// Mock electron's app.getPath
jest.mock('electron', () => ({
  app: {
    getPath: jest.fn()
  }
}));

describe('StorageService', () => {
  let storageService: StorageService;
  let testDir: string;

  beforeEach(async () => {
    testDir = path.join(__dirname, `test-data-${Date.now()}`);
    (app.getPath as jest.Mock).mockReturnValue(testDir);
    
    storageService = new StorageService();
    await storageService.initialize('test-password');
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  test('should save and retrieve transactions', async () => {
    const testTransactions = [
      { id: 1, amount: 100, description: 'Test 1' },
      { id: 2, amount: 200, description: 'Test 2' }
    ];

    await storageService.saveTransactions(testTransactions);
    const retrieved = await storageService.getTransactions();
    expect(retrieved).toEqual(testTransactions);
  });

  test('should save and retrieve categories', async () => {
    const testCategories = [
      { id: 1, name: 'Groceries' },
      { id: 2, name: 'Entertainment' }
    ];

    await storageService.saveCategories(testCategories);
    const retrieved = await storageService.getCategories();
    expect(retrieved).toEqual(testCategories);
  });

  test('should return empty array for non-existent data', async () => {
    const transactions = await storageService.getTransactions();
    expect(transactions).toEqual([]);
  });

  test('should throw error when not initialized', async () => {
    const uninitializedService = new StorageService();
    await expect(uninitializedService.getTransactions())
      .rejects
      .toThrow('StorageService not initialized');
  });
}); 