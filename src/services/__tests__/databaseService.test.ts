import { DatabaseService } from '../databaseService';
import { Transaction } from '../../types/transaction';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';

describe('DatabaseService', () => {
  let dbService: DatabaseService;
  const TEST_DB_PATH = 'test-finance-tracker.db';

  beforeEach(async () => {
    dbService = new DatabaseService(TEST_DB_PATH);
    await dbService.initialize();
  });

  afterEach(async () => {
    if (existsSync(TEST_DB_PATH)) {
      await unlink(TEST_DB_PATH);
    }
  });

  describe('saveTransactions', () => {
    it('should save transactions to database', async () => {
      const transactions: Transaction[] = [{
        id: 'test-id-1',
        date: new Date('2024-02-20'),
        description: 'Test Transaction',
        amount: 100,
        type: 'credit',
        accountId: 'test-account',
        createdAt: new Date(),
        updatedAt: new Date()
      }];

      await dbService.saveTransactions(transactions);

      // Verify saved transaction
      const saved = await dbService.getTransactions('test-account');
      expect(saved).toHaveLength(1);
      expect(saved[0]).toMatchObject({
        id: 'test-id-1',
        description: 'Test Transaction',
        amount: 100,
        type: 'credit',
        accountId: 'test-account'
      });
    });
  });
}); 