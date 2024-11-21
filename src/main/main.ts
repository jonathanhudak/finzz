import { StorageService } from '../services/storageService';

// Initialize storage service
const storageService = new StorageService();

async function initializeApp() {
  await storageService.initialize('user-password');
  
  await storageService.saveTransactions([
    { id: 1, amount: 100, description: 'Grocery shopping' }
  ]);
  
  const transactions = await storageService.getTransactions();
}

initializeApp(); 