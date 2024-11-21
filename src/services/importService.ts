import { parse } from 'csv-parse/sync';
import { ImportedTransaction, Transaction } from '../types/transaction';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';

export class ImportService {
  private detectDelimiter(firstLine: string): string {
    const delimiters = [',', ';', '\t'];
    return delimiters.reduce((selected, current) => {
      const count = (firstLine.match(new RegExp(current, 'g')) || []).length;
      return count > (firstLine.match(new RegExp(selected, 'g')) || []).length ? current : selected;
    });
  }

  async parseCsvFile(fileContent: string, accountId: string): Promise<Transaction[]> {
    const delimiter = this.detectDelimiter(fileContent.split('\n')[0]);
    
    const records = parse(fileContent, {
      delimiter,
      columns: true,
      skip_empty_lines: true,
    });

    return records.map((record: any) => this.mapToTransaction(record, accountId));
  }

  private mapToTransaction(record: any, accountId: string): Transaction {
    const now = new Date();
    
    // Basic mapping - you'll need to adjust this based on your CSV structure
    const imported: ImportedTransaction = {
      date: record.date || record.Date || record.DATE,
      description: record.description || record.Description || record.DESC || record.DESCRIPTION,
      amount: parseFloat(record.amount || record.Amount || record.AMOUNT),
      type: this.determineTransactionType(record),
    };

    return {
      id: uuidv4(),
      date: new Date(imported.date),
      description: imported.description,
      amount: Math.abs(imported.amount),
      type: imported.type || this.determineTransactionType(imported.amount),
      accountId,
      category: imported.category,
      notes: imported.notes,
      createdAt: now,
      updatedAt: now,
    };
  }

  private determineTransactionType(record: any): 'credit' | 'debit' {
    if (record.type || record.Type) {
      const type = (record.type || record.Type).toLowerCase();
      if (type.includes('credit') || type.includes('deposit')) return 'credit';
      if (type.includes('debit') || type.includes('withdrawal')) return 'debit';
    }
    
    // If no explicit type, determine by amount
    const amount = parseFloat(record.amount || record.Amount || record.AMOUNT);
    return amount >= 0 ? 'credit' : 'debit';
  }

  async parseExcelFile(buffer: Buffer, accountId: string): Promise<Transaction[]> {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert Excel sheet to JSON
    const records = XLSX.utils.sheet_to_json(worksheet);
    
    return records.map((record: any) => this.mapToTransaction(record, accountId));
  }

  async parseFile(file: { buffer: Buffer; name: string }, accountId: string): Promise<Transaction[]> {
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.csv')) {
      const content = file.buffer.toString('utf-8');
      return this.parseCsvFile(content, accountId);
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      return this.parseExcelFile(file.buffer, accountId);
    } else {
      throw new Error('Unsupported file format. Please use CSV or Excel files.');
    }
  }
} 