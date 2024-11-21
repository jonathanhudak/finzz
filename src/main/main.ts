import { StorageService } from '../services/storageService';

// Initialize storage service
const storageService = new StorageService();

// During app startup/login
await storageService.initialize('user-password');

// Save data
await storageService.saveTransactions([
  { id: 1, amount: 100, description: 'Grocery shopping' }
]);

// Retrieve data
const transactions = await storageService.getTransactions(); 