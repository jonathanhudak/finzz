import { SecureStorage } from '../secureStorage';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

describe('SecureStorage', () => {
  let secureStorage: SecureStorage;
  let testDir: string;

  beforeEach(async () => {
    // Create a temporary directory for tests
    testDir = path.join(os.tmpdir(), `secure-storage-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
    secureStorage = new SecureStorage(testDir);
    await secureStorage.initialize('test-password');
  });

  afterEach(async () => {
    // Clean up test directory
    await fs.rm(testDir, { recursive: true, force: true });
  });

  test('should store and retrieve data correctly', async () => {
    const testData = { test: 'data', number: 123 };
    await secureStorage.store('test-key', testData);
    const retrieved = await secureStorage.retrieve('test-key');
    expect(retrieved).toEqual(testData);
  });

  test('should handle non-existent keys', async () => {
    const retrieved = await secureStorage.retrieve('non-existent');
    expect(retrieved).toBeNull();
  });

  test('should throw error when not initialized', async () => {
    const uninitializedStorage = new SecureStorage(testDir);
    await expect(uninitializedStorage.store('test', {}))
      .rejects
      .toThrow('SecureStorage not initialized');
  });

  test('should maintain data integrity', async () => {
    const testData = { sensitive: 'information' };
    await secureStorage.store('integrity-test', testData);

    // Try to tamper with the stored file
    const filePath = path.join(testDir, 'integrity-test.json');
    const fileContent = JSON.parse(await fs.readFile(filePath, 'utf8'));
    fileContent.data = fileContent.data.replace(/./g, 'x');
    await fs.writeFile(filePath, JSON.stringify(fileContent));

    // Should throw error when reading tampered data
    await expect(secureStorage.retrieve('integrity-test'))
      .rejects
      .toThrow();
  });

  test('should create unique encryptions for same data', async () => {
    const testData = { test: 'data' };
    await secureStorage.store('test1', testData);
    await secureStorage.store('test2', testData);

    const file1 = await fs.readFile(path.join(testDir, 'test1.json'), 'utf8');
    const file2 = await fs.readFile(path.join(testDir, 'test2.json'), 'utf8');
    expect(file1).not.toBe(file2);
  });
}); 