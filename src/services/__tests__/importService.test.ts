import { ImportService } from '../importService';
import * as XLSX from 'xlsx';

describe('ImportService', () => {
  let importService: ImportService;

  beforeEach(() => {
    importService = new ImportService();
  });

  describe('parseCsvFile', () => {
    it('should parse CSV content with comma delimiter', async () => {
      const csvContent = `date,description,amount
2024-02-20,Grocery Store,-50.25
2024-02-21,Salary,1000.00`;

      const result = await importService.parseCsvFile(csvContent, 'test-account-id');

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        date: new Date('2024-02-20'),
        description: 'Grocery Store',
        amount: 50.25,
        type: 'debit',
        accountId: 'test-account-id'
      });
      expect(result[1]).toMatchObject({
        date: new Date('2024-02-21'),
        description: 'Salary',
        amount: 1000.00,
        type: 'credit',
        accountId: 'test-account-id'
      });
    });

    it('should parse CSV content with semicolon delimiter', async () => {
      const csvContent = `date;description;amount
2024-02-20;Grocery Store;-50.25`;

      const result = await importService.parseCsvFile(csvContent, 'test-account-id');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        date: new Date('2024-02-20'),
        description: 'Grocery Store',
        amount: 50.25,
        type: 'debit',
        accountId: 'test-account-id'
      });
    });
  });

  describe('parseExcelFile', () => {
    it('should parse Excel content', async () => {
      const workbook = XLSX.utils.book_new();
      const wsData = [
        ['date', 'description', 'amount'],
        ['2024-02-20', 'Grocery Store', -50.25],
        ['2024-02-21', 'Salary', 1000.00]
      ];
      const worksheet = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      const result = await importService.parseExcelFile(buffer, 'test-account-id');

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        date: new Date('2024-02-20'),
        description: 'Grocery Store',
        amount: 50.25,
        type: 'debit',
        accountId: 'test-account-id'
      });
      expect(result[1]).toMatchObject({
        date: new Date('2024-02-21'),
        description: 'Salary',
        amount: 1000.00,
        type: 'credit',
        accountId: 'test-account-id'
      });
    });
  });

  describe('parseFile', () => {
    it('should handle CSV files', async () => {
      const csvContent = `date,description,amount
2024-02-20,Grocery Store,-50.25`;
      
      const file = {
        buffer: Buffer.from(csvContent),
        name: 'test.csv'
      };

      const result = await importService.parseFile(file, 'test-account-id');
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        description: 'Grocery Store',
        amount: 50.25,
        type: 'debit'
      });
    });

    it('should handle Excel files', async () => {
      const workbook = XLSX.utils.book_new();
      const wsData = [
        ['date', 'description', 'amount'],
        ['2024-02-20', 'Grocery Store', -50.25]
      ];
      const worksheet = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      const file = {
        buffer: buffer,
        name: 'test.xlsx'
      };

      const result = await importService.parseFile(file, 'test-account-id');
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        description: 'Grocery Store',
        amount: 50.25,
        type: 'debit'
      });
    });

    it('should throw error for unsupported file types', async () => {
      const file = {
        buffer: Buffer.from('test'),
        name: 'test.txt'
      };

      await expect(importService.parseFile(file, 'test-account-id'))
        .rejects
        .toThrow('Unsupported file format');
    });
  });
}); 